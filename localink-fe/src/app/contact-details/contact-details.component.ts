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
  states: any[] = [];
  cities: any[] = [];
 
  constructor(
    private fb: FormBuilder,
    private http: HttpClient
  ) {
    this.contactForm = this.fb.group({
      phoneCode: ['+91', Validators.required],
      phone: ['', [Validators.required, Validators.pattern(/^[3-9][0-9]{9}$/)]],
      email: ['', [Validators.required, Validators.pattern(/^[a-zA-Z][a-zA-Z0-9._%+-]*@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)]],
      website: ['', Validators.pattern(/^(https?:\/\/)?(www\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,}$/)],
      address: ['', [Validators.required, Validators.pattern(/^(?!\d+$)[A-Za-z0-9\s\-\:\/\,\.]+$/)]],
      country: ['', Validators.required],   // ISO2 code
      state: ['', Validators.required],     // state name
      city: ['', Validators.required],      // city name
      pincode: ['', Validators.pattern(/^[1-9][0-9]{5}$/)]
    }, {
      validators: this.countryPhoneValidator.bind(this)
    });
 
    //  Keep phone validation logic intact
    this.contactForm.get('phoneCode')?.valueChanges.subscribe(code => {
      const phoneControl = this.contactForm.get('phone');
      if (code === '+91') {
        phoneControl?.setValidators([Validators.required, Validators.pattern(/^[3-9][0-9]{9}$/)]);
      } else {
        phoneControl?.setValidators([Validators.required, Validators.pattern(/^(?!0+$)[0-9]{6,15}$/)]);
      }
      phoneControl?.updateValueAndValidity();
    });
  }
 
  ngOnInit() {
    //  Load countries from REST Countries
    this.http.get<any>('http://localhost:5138/api/v1/location/countries')
      .subscribe(res => {
        this.countries = res.map((c: any) => ({
          name: c.name.common,
          iso2: c.cca2,
          flag: c.flags.png,
          phoneCode: '' // REST Countries doesn’t provide phone codes
        }));
 
        this.phoneCountries = this.countries.map((c: any) => ({
          name: c.name,
          code: c.phoneCode,
          flag: c.flag
        }));
      });
  }
 
  onCountryChange() {
    const selectedCode = this.contactForm.get('country')?.value;
    const countryObj = this.countries.find(c => c.iso2 === selectedCode);
 
    if (!countryObj) {
      this.states = [];
      this.cities = [];
      return;
    }
 
    //  Fetch states from CountriesNow
    this.http.post<any>('http://localhost:5138/api/v1/location/states', {
      country: countryObj.name
    }).subscribe(res => {
      this.states = res.data.states.map((s: any) => ({
        name: s.name,
        code: s.name
      }));
      this.contactForm.get('state')?.setValue('');
      this.cities = [];
    });
  }
 
  onStateChange(state: any) {
    const countryCode = this.contactForm.get('country')?.value;
    const countryObj = this.countries.find(c => c.iso2 === countryCode);
 
    if (!countryObj || !state) {
      this.cities = [];
      return;
    }
 
    // Fetch cities from CountriesNow
    this.http.post<any>('http://localhost:5138/api/v1/location/cities', {
      country: countryObj.name,
      state: state.name
    }).subscribe(res => {
      this.cities = res.data.map((c: any) => ({
        name: c,
        code: c
      }));
      this.contactForm.get('city')?.setValue('');
    });
  }
 
  countryPhoneValidator(group: FormGroup) {
    const country = group.get('country')?.value;
    const phoneCode = group.get('phoneCode')?.value;
    const phoneControl = group.get('phone');
 
    const countryObj = this.countries.find(c => c.iso2 === country);
    if (countryObj && countryObj.phoneCode && countryObj.phoneCode !== phoneCode) {
      phoneControl?.setErrors({ ...(phoneControl.errors || {}), countryMismatch: true });
    } else {
      if (phoneControl?.errors) {
        const { countryMismatch, ...otherErrors } = phoneControl.errors;
        phoneControl.setErrors(Object.keys(otherErrors).length ? otherErrors : null);
      }
    }
    return null;
  }
 
  allowOnlyNumbers(event: any) {
    let value = event.target.value.replace(/[^0-9]/g, '');
    if (/^0+$/.test(value)) {
      value = '';
    }
    this.contactForm.get('phone')?.setValue(value);
  }
 
  submit() {
    if (this.contactForm.valid) {
      const form = this.contactForm.value;
      const fullPhone = form.phoneCode + ' ' + form.phone;
      this.next.emit({ ...form, phone: fullPhone });
    } else {
      this.contactForm.markAllAsTouched();
    }
  }
 
  previousStep() {
    this.previous.emit();
  }
}
 
 