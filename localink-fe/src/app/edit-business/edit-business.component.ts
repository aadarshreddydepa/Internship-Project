import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgSelectModule } from '@ng-select/ng-select';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

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

  businessId!: number;

  businessData: any;
  contactData: any;
  hoursData: any = [];
  photoData: string | null = null;

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
    private router: Router,
    private http: HttpClient
  ) {
    this.businessForm = this.fb.group({
      businessName: ['', [Validators.required, Validators.pattern(/^[A-Za-z\s&'-]+$/)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      category: ['', Validators.required],
      subcategory: ['', Validators.required]
    });

    // Keep data synced always
    this.businessForm.valueChanges.subscribe(val => {
      this.businessData = val;
    });
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.businessId = +id;
      this.loadBusinessData(this.businessId);
    }
  }

  // ✅ LOAD FROM BACKEND
  loadBusinessData(id: number) {
    this.http.get<any>(`http://localhost:5173/api/business/${id}`)
      .subscribe(res => {

        this.businessForm.patchValue({
          businessName: res.businessName,
          description: res.description,
          category: res.category,
          subcategory: res.subcategory
        });

        this.onCategoryChange();

        this.contactData = {
          email: res.email,
          city: res.city,
          phone: res.phone
        };
      });
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
        this.hoursErrorMessage = "Please configure business hours";
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
    if (!this.hoursData || this.hoursData.length === 0) return true; // relaxed
    return true;
  }

  // ✅ FINAL UPDATE API CALL
  submitRegistration() {

    const payload = {
      ...this.businessData,
      ...this.contactData
    };

    this.http.put(`http://localhost:5173/api/business/${this.businessId}`, payload)
      .subscribe(() => {

        this.submitSuccessMessage = "Business updated successfully!";

        setTimeout(() => {
          this.router.navigate(['/client-dashboard']);
        }, 1500);

      });
  }
}