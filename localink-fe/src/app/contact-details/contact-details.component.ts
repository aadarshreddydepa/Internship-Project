import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-contact-details',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './contact-details.component.html',
  styleUrls: ['./contact-details.component.css']
})
export class ContactDetailsComponent {

  contactForm!: FormGroup;

  @Output() next = new EventEmitter<void>();
  @Output() previous = new EventEmitter<void>();

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

  submit(){

    if(this.contactForm.valid){
      this.next.emit();
    }else{
      this.contactForm.markAllAsTouched();
    }

  }

  previousStep(){
    this.previous.emit();
  }

}