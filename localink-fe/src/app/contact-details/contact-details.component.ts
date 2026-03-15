import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgSelectModule } from '@ng-select/ng-select';

@Component({
  selector: 'app-contact-details',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgSelectModule],
  templateUrl: './contact-details.component.html',
  styleUrls: ['./contact-details.component.css']
})
export class ContactDetailsComponent implements OnInit {

  contactForm!: FormGroup;


  @Output() next = new EventEmitter<void>();
  @Output() previous = new EventEmitter<void>();

  countries = [
  {
    name: 'Select Country',
    states: []
  },
  {
    name: 'India',
    states: ['Andhra Pradesh','Telangana','Tamil Nadu','Karnataka','Kerala']
  },
  {
    name: 'USA',
    states: ['California','Texas','Florida','New York']
  },
  {
    name: 'Australia',
    states: ['New South Wales','Victoria','Queensland']
  }
];
  states: string[] = ['Select state'];


  constructor(private fb: FormBuilder) {

    this.contactForm = this.fb.group({

      phone: ['', [ Validators.required, Validators.pattern(/^(?!([0-9])\1{9})[6-9][0-9]{9}$/)]],

      email: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9][a-zA-Z0-9._%+-]*@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)]],

      website: ['', Validators.pattern(/^(https?:\/\/)?(www\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,}$/)],

      address: ['', Validators.required],

      city: ['', Validators.required],

      state: ['', Validators.required],

      country: ['', Validators.required],

      pincode: ['', [Validators.pattern(/^[1-9][0-9]{5}$/)]]

    });

    this.contactForm.get('country')?.valueChanges.subscribe((country) => {
    if (country === 'India') {
      this.contactForm.get('phone')?.setValidators([
        Validators.required,
        Validators.pattern(/^\+91[6-9][0-9]{9}$/) // must start with +91
      ]);
    } else {
      this.contactForm.get('phone')?.setValidators([
        Validators.required,
        Validators.pattern(/^[0-9]{7,15}$/) // generic international format
      ]);
    }
    this.contactForm.get('phone')?.updateValueAndValidity();
  });

  }

  

  ngOnInit() {

  const savedData = localStorage.getItem('contactDetails');

  if (savedData) {

    const data = JSON.parse(savedData);

    this.contactForm.patchValue(data);

    // Load states based on saved country
    const countryObj = this.countries.find(c => c.name === data.country);
    this.states = countryObj ? countryObj.states : [];

  }

}

onCountryChange() {

  const selectedCountry = this.contactForm.get('country')?.value;

  if(selectedCountry === 'Select Country'){
    this.states = ['Select State'];
    this.contactForm.get('state')?.setValue('Select State');
    return;
  }

  const countryObj = this.countries.find(c => c.name === selectedCountry);

  this.states = countryObj 
    ? ['Select State', ...countryObj.states] 
    : ['Select State'];

  this.contactForm.get('state')?.setValue('Select State');

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