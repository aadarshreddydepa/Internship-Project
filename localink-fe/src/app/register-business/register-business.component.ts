import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register-business',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register-business.component.html',
  styleUrls: ['./register-business.component.css']
})
export class RegisterBusinessComponent {

  businessForm!: FormGroup;

  categories = [
    { name: 'Food', subcategories: ['Restaurant', 'Cafe', 'Bakery'] },
    { name: 'Retail', subcategories: ['Clothing', 'Electronics', 'Supermarket'] },
    { name: 'Services', subcategories: ['Salon', 'Repair', 'Consulting'] }
  ];

  subcategories: string[] = [];

  constructor(private fb: FormBuilder, private router: Router) {

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

    if (this.businessForm.valid) {
      this.router.navigate(['/contact-details']);
    } 
    else {
      this.businessForm.markAllAsTouched();
    }

  }

}