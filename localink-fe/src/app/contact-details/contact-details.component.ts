import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-contact-details',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './contact-details.component.html',
  styleUrls: ['./contact-details.component.css']
})
export class ContactDetailsComponent {

  contactForm!: FormGroup;

  successMessage = false;

  constructor(private fb: FormBuilder) {

    this.contactForm = this.fb.group({

      phone: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],

      email: ['', [Validators.required, Validators.email]],

      website: ['', [Validators.pattern('https?://.+')]],

      address: ['', Validators.required],

      city: ['', Validators.required],

      state: ['', Validators.required],

      pincode: ['', [Validators.required, Validators.pattern('^[0-9]{6}$')]]

    });

  }

  submit() {

    if (this.contactForm.valid) {

      console.log("Form Data:", this.contactForm.value);

      this.successMessage = true;

    } 
    else {

      this.contactForm.markAllAsTouched();

      this.successMessage = false;

    }

  }

}