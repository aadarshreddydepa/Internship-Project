import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { NgSelectModule } from '@ng-select/ng-select';
import { HttpClient } from '@angular/common/http';

import { BusinessService } from '../services/register-business.service'; // adjust path if needed

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
  subcategories: string[] = [];
  hoursData: any = [];
  photoData: string | null = null;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private businessService: BusinessService,
    private router: Router
  ) {
      this.businessForm = this.fb.group({
        businessName: [
        '',
        [
          Validators.required,
          Validators.pattern(/^[A-Za-z\s&'-]+$/)  // letters, spaces, &, ', -
        ]
      ],

        description: [
        '',
        [
          Validators.required,
            Validators.minLength(10),
            Validators.pattern(/^[A-Za-z][A-Za-z\s.,'()%!]*$/)// only letters and spaces
        ]
      ],

        category: ['', Validators.required],
        subcategory: ['', Validators.required]
      });
    }

    ngOnInit(): void {
      // If you want to do any initialization later
      this.http.get<any>('data/categories.json').subscribe(data => {
    this.categories = data.categories;
  });
  }

  onCategoryChange() {
    const selectedCategory = this.businessForm.get('category')?.value;
    const categoryObj = this.categories.find(cat => cat.name === selectedCategory);
    this.subcategories = categoryObj ? categoryObj.subcategories : [];
    // this.businessForm.patchValue({ subcategory: '' });
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
    }
    else if (this.currentStep === 3) {
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

  savePhoto(photo: string) {
    this.photoData = photo;
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

  submitRegistration() {

  console.log("CONTACT DATA:", this.contactData);
  console.log("SUBMIT CLICKED");

  this.finalRegistrationData = {
    businessName: this.businessData.businessName,
    description: this.businessData.description,
    category: this.businessData.category,
    subcategory: this.businessData.subcategory,

    phoneCode: this.contactData.phoneCode,
    //phoneNumber: this.contactData.phone,
    //phoneNumber: this.contactData.phone ? this.contactData.phone.replace(/[^\d]/g, '').slice(-10) : '',
    phoneNumber: this.contactData.phone.replace(this.contactData.phoneCode, ''),
    email: this.contactData.email,
    website: this.contactData.website,

    address: this.contactData.address,

    city: this.contactData.city,
    state: this.contactData.state,
    country: this.contactData.country,
    pincode: this.contactData.pincode,

    hours: this.hoursData,
    photo: this.photoData
  };

  console.log("Sending Data:", this.finalRegistrationData);
  this.businessService.registerBusiness(this.finalRegistrationData).subscribe({
    next: (res) => {
      console.log("Success:", res);

      //  Show success message
      this.submitSuccessMessage = "Business registered successfully!";

      //  Redirect after 2 seconds
      setTimeout(() => {
        this.router.navigate(['/client-dashboard']); // make sure route exists
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