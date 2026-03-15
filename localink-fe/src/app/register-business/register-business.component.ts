import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';
import { NgSelectModule } from '@ng-select/ng-select';

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
  templateUrl: './register-business.component.html',
  styleUrls: ['./register-business.component.css']
})
export class RegisterBusinessComponent {

  currentStep = 1;
  businessForm!: FormGroup;
  businessData: any;
  contactData: any;
  hoursErrorMessage = '';

  categories = [
    { name: 'Food', subcategories: ['Restaurant', 'Cafe', 'Bakery'] },
    { name: 'Retail', subcategories: ['Clothing', 'Electronics', 'Supermarket'] },
    { name: 'Services', subcategories: ['Salon', 'Repair', 'Consulting'] }
  ];
  hoursData: any = [];
  photoData: string | null = null;

  subcategories: string[] = [];

  constructor(
    private fb: FormBuilder,
    @Inject(PLATFORM_ID) private platformId: Object
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
        Validators.pattern(/^[A-Za-z][A-Za-z\s]*$/) // only letters and spaces
      ]
    ],

      category: ['', Validators.required],
      subcategory: ['', Validators.required]
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
    alert("Business Registered Successfully!");

    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('businessDetails');
      localStorage.removeItem('contactDetails');
    }

    this.businessData = null;
    this.contactData = null;
    this.businessForm.reset();
    this.currentStep = 1;
  }
}