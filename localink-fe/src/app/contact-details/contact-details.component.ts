import { Component, EventEmitter, Output, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgSelectModule } from '@ng-select/ng-select';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-contact-details',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgSelectModule],
  templateUrl: './contact-details.component.html',
  styleUrls: ['./contact-details.component.css']
})
export class ContactDetailsComponent implements OnInit {

  contactForm!: FormGroup;

  @Input() initialData: any;
  @Output() next = new EventEmitter<any>();
  @Output() previous = new EventEmitter<void>();

  phoneCountries: any[] = [];
  countries: any[] = [];
  states: string[] = [];

  constructor(
    private fb: FormBuilder,
    private http: HttpClient
  ) {

    this.contactForm = this.fb.group({

      phoneCode: ['+91', Validators.required],

      phone: [
        '',
        [
          Validators.required,
          // Validators.pattern(/^[2-9][0-9]{10}$/)
          Validators.pattern(/^\+?[1-9]\d{6,14}$/)
        ]
      ],

      email: [
        '',
        [
          Validators.required,
          Validators.pattern(/^[a-zA-Z][a-zA-Z0-9._%+-]*@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
        ]
      ],

      website: [
        '',
        Validators.pattern(/^(https?:\/\/)?(www\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,}$/)
      ],

      address: ['', Validators.required],

      city: ['', Validators.required],

      state: ['', Validators.required],

      country: ['', Validators.required],

      pincode: [
        '',
        Validators.pattern(/^[1-9][0-9]{5}$/)
      ]

    }, {
      validators: this.countryPhoneValidator.bind(this)
    });

  }

  ngOnInit() {

    this.http.get<any>('data/countries.json')
      .subscribe(data => {

        this.countries = data;

        // Extract phone countries from same JSON
        this.phoneCountries = data.map((c: any) => ({
          name: c.name,
          code: c.code,
          flag: c.flag
        }));

        // Restore data if returning from next step
        if (this.initialData) {

          this.contactForm.patchValue(this.initialData);

          const countryObj = this.countries.find(
            c => c.name === this.initialData.country
          );

          this.states = countryObj ? countryObj.states : [];

        }

      });

  }
  onCountryChange() {

    const selectedCountry = this.contactForm.get('country')?.value;

    const countryObj = this.countries.find(
      c => c.name === selectedCountry
    );

    this.states = countryObj ? countryObj.states : [];

    this.contactForm.get('state')?.setValue('');

    // Revalidate phone-country relation
    this.contactForm.updateValueAndValidity();

  }
  countryPhoneValidator(group: FormGroup) {

    const country = group.get('country')?.value;
    const phoneCode = group.get('phoneCode')?.value;

    const phoneControl = group.get('phone');

    const countryObj = this.countries.find(c => c.name === country);

    if (countryObj && countryObj.code !== phoneCode) {

      phoneControl?.setErrors({
        ...(phoneControl.errors || {}),
        countryMismatch: true
      });

    } else {

      if (phoneControl?.errors) {

        const { countryMismatch, ...otherErrors } = phoneControl.errors;

        phoneControl.setErrors(
          Object.keys(otherErrors).length ? otherErrors : null
        );

      }

    }

    return null;

  }
  submit() {

    if (this.contactForm.valid) {

      const form = this.contactForm.value;

      const fullPhone = form.phoneCode + ' ' + form.phone;

      this.next.emit({
        ...form,
        phone: fullPhone
      });

    }
    else {

      this.contactForm.markAllAsTouched();

    }

  }
  previousStep() {
    this.previous.emit();
  }

}