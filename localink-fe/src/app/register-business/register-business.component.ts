import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';
import { NgSelectModule } from '@ng-select/ng-select';

import { ContactDetailsComponent } from '../contact-details/contact-details.component';
import { HoursComponent } from '../business/hours/hours.component';
import { PhotoUploadComponent } from '../business/photo-upload/photo-upload.component';

@Component({
  selector: 'app-register-business',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NgSelectModule,
    ContactDetailsComponent,
    HoursComponent,
    PhotoUploadComponent
  ],
  templateUrl: './register-business.component.html',
  styleUrls: ['./register-business.component.css']
})
export class RegisterBusinessComponent implements OnInit {

  currentStep = 1;
  businessForm!: FormGroup;
  businessData: any;
  contactData: any;

  categories = [
    { name: 'Food', subcategories: ['Restaurant', 'Cafe', 'Bakery'] },
    { name: 'Retail', subcategories: ['Clothing', 'Electronics', 'Supermarket'] },
    { name: 'Services', subcategories: ['Salon', 'Repair', 'Consulting'] }
  ];

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

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      const savedBusiness = localStorage.getItem('businessDetails');
      if (savedBusiness && this.currentStep !== 1) {
        this.businessForm.patchValue(JSON.parse(savedBusiness));
      }
    }
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
        if (isPlatformBrowser(this.platformId)) {
          localStorage.setItem('businessDetails', JSON.stringify(this.businessForm.value));
        }
        this.currentStep = 2;
      } else {
        this.businessForm.markAllAsTouched();
      }
    } else if (this.currentStep === 2) {
      this.currentStep = 3;
    } else if (this.currentStep === 3) {
      if (isPlatformBrowser(this.platformId)) {
        this.businessData = JSON.parse(localStorage.getItem('businessDetails') || '{}');
        this.contactData = JSON.parse(localStorage.getItem('contactDetails') || '{}');
      }
      this.currentStep = 4;
    }
  }

  goToPrevious() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
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
