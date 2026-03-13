import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-contact-details',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './contact-details.component.html',
  styleUrls: ['./contact-details.component.css']
})
export class ContactDetailsComponent implements OnInit {

  contactForm!: FormGroup;

  @Output() next = new EventEmitter<void>();
  @Output() previous = new EventEmitter<void>();

  constructor(private fb: FormBuilder) {

    this.contactForm = this.fb.group({

      phone: ['', [ Validators.required, Validators.pattern(/^(?!([0-9])\1{9})[6-9][0-9]{9}$/)]],

      email: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9][a-zA-Z0-9._%+-]*@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)]],

      website: ['', Validators.pattern(/^(https?:\/\/)?(www\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,}$/)],

      address: ['', Validators.required],

      city: ['', Validators.required],

      state: ['', Validators.required],

      pincode: ['', [Validators.pattern(/^[1-9][0-9]{5}$/)]]

    });

  }

  ngOnInit(){

  const savedData = localStorage.getItem('contactDetails');

  if(savedData){

    this.contactForm.patchValue(
      JSON.parse(savedData)
    );

  }

}

  submit(){

  if(this.contactForm.valid){

    // save to local storage
    localStorage.setItem(
      'contactDetails',
      JSON.stringify(this.contactForm.value)
    );

    this.next.emit();

  }else{

    this.contactForm.markAllAsTouched();

  }

}

  previousStep(){
    this.previous.emit();
  }

}