import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgSelectModule } from '@ng-select/ng-select';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgSelectModule],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent {
  signupForm: FormGroup;
  showPassword = false;
  showConfirmPassword = false;
  showSuccessPopup = false;
  countries = [
    {
      name: 'India',
      states: ['Tamil Nadu','Karnataka','Kerala','Maharashtra']
    },
    {
      name: 'United States',
      states: ['California','Texas','Florida','New York']
    },
    {
      name: 'Canada',
      states: ['Ontario','Quebec','British Columbia','Alberta']
    },
    {
      name: 'Australia',
      states: ['New South Wales','Victoria','Queensland','Western Australia']
    },
    {
      name: 'United Kingdom',
      states: ['England','Scotland','Wales','Northern Ireland']
    },
    {
      name: 'Germany',
      states: ['Bavaria','Berlin','Hamburg','Hesse']
    },
    {
      name: 'France',
      states: ['Île-de-France','Normandy','Brittany','Occitanie']
    },
    {
      name: 'Japan',
      states: ['Tokyo','Osaka','Hokkaido','Kyoto']
    },
    {
      name: 'Singapore',
      states: ['Central','North East','North West','South East']
    },
    {
      name: 'UAE',
      states: ['Dubai','Abu Dhabi','Sharjah','Ajman']
    }
  ];
  states: string[] = [];

  constructor(private fb: FormBuilder) {
    this.signupForm = this.fb.group({
      userType: ['', Validators.required],

      name: [
        '',
        [
          Validators.required,
          Validators.pattern('^\\S(.*\\S)?$')
        ]
      ],
      email: [
        '',
        [
          Validators.required,
          Validators.pattern('^[a-zA-Z0-9]+([._%+-]?[a-zA-Z0-9]+)*@[a-zA-Z0-9-]+(\\.[a-zA-Z]{2,})+$'),
          Validators.pattern('^\\S+$')
        ]
      ],
      phone: [
        '',
        [
          Validators.required,
          Validators.pattern('^[0-9]{10}$')
        ]
      ],

      street: [
        '',
        [
          Validators.required,
          Validators.pattern('^\\S(.*\\S)?$')
        ]
      ],

      city: [
        '',
        [
          Validators.required,
          Validators.pattern('^\\S(.*\\S)?$')
        ]
      ],
      state: [
        '',
        [
          Validators.required,
          Validators.pattern('^\\S(.*\\S)?$')
        ]
      ],
      country: [
        '',
        [
          Validators.required,
          Validators.pattern('^\\S(.*\\S)?$')
        ]
      ],
      pincode: [
        '',
        [
          Validators.required,
          Validators.pattern('^[1-9][0-9]{5}$')
        ]
      ],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*]).{8,}$'),
          Validators.pattern('^\\S(.*\\S)?$')
        ]
      ],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(form: AbstractControl): ValidationErrors | null {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    if (password !== confirmPassword) {
      return { passwordMismatch: true };
    }
    return null;
  }

  onCountryChange(countryName: string) {

    const selectedCountry = this.countries.find(
      c => c.name === countryName
    );

    this.states = selectedCountry ? selectedCountry.states : [];

    this.signupForm.patchValue({
      state: ''
    });

  }

  onSubmit() {
    if (this.signupForm.valid) {
      console.log("Signup Data:", this.signupForm.value);
      this.showSuccessPopup = true;
      this.signupForm.reset();
    }
  }


  togglePassword() {
    this.showPassword = !this.showPassword;
    this.showSuccessPopup = false;
  }

  toggleConfirmPassword() {
    this.showConfirmPassword = !this.showConfirmPassword;
    this.showSuccessPopup = false;
  }

  closePopup() {
    this.showSuccessPopup = false;
    // add backend server here to submit data to backend
  }

  trimField(fieldName: string) {
    const control = this.signupForm.get(fieldName);
    if (control && typeof control.value === 'string') {
      control.setValue(control.value.trim());
    }
  }

  get f() {
    return this.signupForm.controls;
  }
}