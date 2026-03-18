import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgSelectModule } from '@ng-select/ng-select';
import { ActivatedRoute, Router } from '@angular/router';

import { ContactDetailsComponent } from '../contact-details/contact-details.component';
import { HoursComponent } from '../business/hours/hours.component';
import { PhotoUploadComponent } from '../business/photo-upload/photo-upload.component';
import { PreviewComponent } from '../business/preview/preview.component';

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
  templateUrl: './edit-business.component.html',
  styleUrls: ['./edit-business.component.css']
})
export class EditBusinessBusinessComponent implements OnInit {

  currentStep = 1;
  businessForm!: FormGroup;

  businessData: any;
  contactData: any;
  hoursData: any = [];
  photoData: string | null = null;

  finalRegistrationData: any = null;
  submitSuccessMessage = '';
  hoursErrorMessage = '';

  categories = [
    { name: 'Food', subcategories: ['Restaurant', 'Cafe', 'Bakery'] },
    { name: 'Retail', subcategories: ['Clothing', 'Electronics', 'Supermarket'] },
    { name: 'Services', subcategories: ['Salon', 'Repair', 'Consulting'] }
  ];

  subcategories: string[] = [];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.businessForm = this.fb.group({
      businessName: ['', [Validators.required, Validators.pattern(/^[A-Za-z\s&'-]+$/)]],
      description: ['', [Validators.required, Validators.minLength(10), Validators.pattern(/^[A-Za-z][A-Za-z\s.,'()%!]*$/)]],
      category: ['', Validators.required],
      subcategory: ['', Validators.required]
    });

    // 🔥 Keep data synced always
    this.businessForm.valueChanges.subscribe(val => {
      this.businessData = val;
    });
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.loadBusinessData(+id);
    }
  }

  // ✅ LOAD EXISTING DATA
  loadBusinessData(id: number) {

    // 🔥 Replace with API later
    const mockData = {
      businessName: 'My Restaurant',
      description: 'Best food in town',
      category: 'Food',
      subcategory: 'Restaurant',

      contact: {
        phone: '+91 9876543210',
        email: 'test@gmail.com',
        website: 'www.test.com',
        address: 'Street 1',
        city: 'Chennai',
        state: 'Tamil Nadu',
        country: 'India',
        pincode: '600001'
      },

      hours: [],
      photo: null
    };

    this.businessForm.patchValue({
      businessName: mockData.businessName,
      description: mockData.description,
      category: mockData.category,
      subcategory: mockData.subcategory
    });

    this.onCategoryChange();

    this.contactData = mockData.contact;
    this.hoursData = mockData.hours;
    this.photoData = mockData.photo;
  }

  onCategoryChange() {
    const selectedCategory = this.businessForm.get('category')?.value;
    const categoryObj = this.categories.find(cat => cat.name === selectedCategory);
    this.subcategories = categoryObj ? categoryObj.subcategories : [];
    this.businessForm.get('subcategory')?.setValue('');
  }

  goToNext() {
    if (this.currentStep === 1) {
      if (this.businessForm.valid) {
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
    if (!this.hoursData || this.hoursData.length === 0) return false;

    for (let day of this.hoursData) {
      if (day.mode === 'custom') {
        if (!day.slots || day.slots.length === 0) return false;
        for (let slot of day.slots) {
          if (!slot.open || !slot.close) return false;
        }
      }
    }
    return true;
  }

  // ✅ FINAL SAVE
  submitRegistration() {

    this.finalRegistrationData = {
      ...this.businessData,
      ...this.contactData,
      hours: this.hoursData,
      photo: this.photoData
    };

    console.log("Updated Business Payload:", this.finalRegistrationData);

    this.submitSuccessMessage = "Business details updated successfully!";

    setTimeout(() => {
      this.submitSuccessMessage = '';
      this.router.navigate(['/client-dashboard']);
    }, 3000);
  }
}