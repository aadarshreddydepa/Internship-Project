import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { ContactDetailsComponent } from '../contact-details/contact-details.component';
import { HoursComponent } from '../business/hours/hours.component';
import { PhotoUploadComponent } from '../business/photo-upload/photo-upload.component';

@Component({
  selector: 'app-register-business',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ContactDetailsComponent,
    HoursComponent,
    PhotoUploadComponent
  ],
  templateUrl: './register-business.component.html',
  styleUrls: ['./register-business.component.css']
})
export class RegisterBusinessComponent {

  currentStep = 1;

  businessForm!: FormGroup;

  categories = [
    { name: 'Food', subcategories: ['Restaurant', 'Cafe', 'Bakery'] },
    { name: 'Retail', subcategories: ['Clothing', 'Electronics', 'Supermarket'] },
    { name: 'Services', subcategories: ['Salon', 'Repair', 'Consulting'] }
  ];

  subcategories: string[] = [];

  constructor(private fb: FormBuilder) {

    this.businessForm = this.fb.group({
      businessName: ['', Validators.required],
      description: ['', Validators.required],
      category: ['', Validators.required],
      subcategory: ['', Validators.required]
    });

  }

  onCategoryChange() {

    const selectedCategory = this.businessForm.get('category')?.value;

    const categoryObj = this.categories.find(
      cat => cat.name === selectedCategory
    );

    this.subcategories = categoryObj ? categoryObj.subcategories : [];

    this.businessForm.patchValue({ subcategory: '' });

  }

  goToNext() {

    if (this.currentStep === 1) {

      if (this.businessForm.valid) {
        this.currentStep = 2;
      } else {
        this.businessForm.markAllAsTouched();
      }

    } else if (this.currentStep < 3) {
      this.currentStep++;
    }

  }

  goToPrevious() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

}