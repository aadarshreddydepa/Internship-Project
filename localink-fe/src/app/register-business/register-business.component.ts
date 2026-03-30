import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgSelectModule } from '@ng-select/ng-select';
import { HttpClient } from '@angular/common/http';

import { BusinessService } from '../services/register-business.service';

import { ContactDetailsComponent } from '../contact-details/contact-details.component';
import { HoursComponent } from '../business/hours/hours.component';
import { PhotoUploadComponent } from '../business/photo-upload/photo-upload.component';
import { PreviewComponent } from '../business/preview/preview.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register-business',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NgSelectModule,
    ContactDetailsComponent,
    HoursComponent,
    PhotoUploadComponent,
    PreviewComponent
  ],
  templateUrl: './register-business.component.html',
  styleUrls: ['./register-business.component.css']
})
export class RegisterBusinessComponent {

  currentStep = 1;
  businessForm!: FormGroup;
  businessData: any;
  contactData: any;

  finalRegistrationData: any = null;
  submitSuccessMessage = '';
  hoursErrorMessage = '';

  categories: any[] = [];
  subcategories: any[] = [];
  hoursData: any = [];
  photoData: string | null = null;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private businessService: BusinessService,
    private router: Router
  ) {
    this.businessForm = this.fb.group({
      businessName: ['', [Validators.required, Validators.pattern(/^[A-Za-z\s&'-]+$/)]],
      description: ['', [
        Validators.required,
        Validators.minLength(10),
        Validators.pattern(/^[A-Za-z][A-Za-z\s.,'()%!]*$/)
      ]],
      category: ['', Validators.required],
      subcategory: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.http.get<any>('http://localhost:5138/api/v1/categories')
      .subscribe(data => {
        console.log("Data::: ", data);
        this.categories = data;
      });
  }

  onCategoryChange() {
    const categoryId = this.businessForm.get('category')?.value;

    this.http.get<any>(`http://localhost:5138/api/v1/categories/${categoryId}/subcategories`)
      .subscribe(data => {
        this.subcategories = data;
      });

    this.businessForm.get('subcategory')?.setValue('');
  }

  goToNext() {
    if (this.currentStep === 1) {
      if (this.businessForm.valid) {
        this.businessData = this.businessForm.value;
        this.currentStep = 2;
      } else {
        this.businessForm.markAllAsTouched();
      }
    } else if (this.currentStep === 3) {
      if (!this.validateBusinessHours()) {
        this.hoursErrorMessage = "Please configure business hours for all days";
        return;
      }
      this.hoursErrorMessage = '';
      this.currentStep = 4;
    }
  }

  goToPrevious() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  saveContactAndNext(data: any) {
    this.contactData = data;
    this.currentStep = 3;
  }

  saveHours(hours: any) {
    this.hoursData = hours;
    this.hoursErrorMessage = '';
  }

  savePhoto(photo: string | null) {
    this.photoData = photo;
  }

  //  FIX: Convert time to backend format
  convertToTimeSpan(time: string): string {
    const [hour, minutePart] = time.split(':');
    let [minute, period] = minutePart.split(' ');
    let h = parseInt(hour);

    if (period === 'PM' && h !== 12) h += 12;
    if (period === 'AM' && h === 12) h = 0;

    return `${h.toString().padStart(2, '0')}:${minute}:00`;
  }

  validateBusinessHours(): boolean {
    if (!this.hoursData || this.hoursData.length === 0) {
      return false;
    }
    for (let day of this.hoursData) {
      if (day.mode === 'custom') {
        if (!day.slots || day.slots.length === 0) {
          return false;
        }
        for (let slot of day.slots) {
          if (!slot.open || !slot.close) {
            return false;
          }
        }
      }
    }
    return true;
  }
  getCategoryId(categoryName: string): number {
    const category = this.categories.find(c => c.name === categoryName);
    return category ? category.id : 0;
  }

  getSubcategoryId(): number {
    const selectedCategory = this.categories.find(
      c => c.name === this.businessData.category
    );

    if (!selectedCategory) return 0;

    const sub = selectedCategory.subcategories.find(
      (s: any) => s.name === this.businessData.subcategory
    );

    return sub ? sub.id : 0;
  }

  submitRegistration() {

    console.log("SUBMIT CLICKED");

    // FIX: Transform hours
    const formattedHours = this.hoursData.map((day: any) => ({
      dayOfWeek: day.dayOfWeek ?? day.day ?? '',
      mode: day.mode,
      slots: (day.slots || []).map((slot: any) => ({
        openTime: this.convertToTimeSpan(slot.open),
        closeTime: this.convertToTimeSpan(slot.close)
      }))
    }));

    

    this.finalRegistrationData = {
      businessName: this.businessData.businessName,
      description: this.businessData.description,

      //  FIXED
      categoryId: this.businessData.category,
      subcategoryId: this.businessData.subcategory,

      userId: 2, // ⚠️ TEMP (replace with logged-in user)

      phoneCode: this.contactData.phoneCode,
      phoneNumber: this.contactData.phone.replace(this.contactData.phoneCode, ''),
      email: this.contactData.email,
      website: this.contactData.website,
      address: this.contactData.address,
      city: this.contactData.city,
      state: this.contactData.state,
      country: this.contactData.country,
      pincode: this.contactData.pincode,

      hours: formattedHours,
      photo: this.photoData
    };
    console.log("FINAL PAYLOAD:", this.finalRegistrationData);

    this.businessService.registerBusiness(this.finalRegistrationData).subscribe({
      next: (res) => {
        console.log("Success:", res);
        this.submitSuccessMessage = "Business registered successfully!";

        setTimeout(() => {
          this.router.navigate(['/client-dashboard']);
        }, 2000);
      },
      error: (err) => {
        console.error("FULL ERROR:", err);

        if (err.error) {
          alert(typeof err.error === 'string'
            ? err.error
            : JSON.stringify(err.error));
        } else {
          alert("Unknown error occurred");
        }
      }
    });
  }
}