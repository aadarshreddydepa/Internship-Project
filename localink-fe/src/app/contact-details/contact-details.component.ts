
import { Component, EventEmitter, Output, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgSelectModule } from '@ng-select/ng-select';
import { HttpClient } from '@angular/common/http';
import { BusinessLocationService } from '../services/business-location.service';
import { BusinessPincodeService } from '../services/business-pincode.service';

@Component({
  selector: 'app-contact-details',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgSelectModule],
  templateUrl: './contact-details.component.html',
  styleUrls: ['./contact-details.component.css']
})
export class ContactDetailsComponent implements OnInit {

  private baseUrl = 'http://localhost:5138/api/location';

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
    private http: HttpClient,
    private locationService: BusinessLocationService,
    private pincodeService: BusinessPincodeService
  ) {

    this.contactForm = this.fb.group({
      phoneCode: ['91', Validators.required],
      phone: [

        '',

        [

          Validators.required,

          Validators.pattern(/^[3-9][0-9]{9}$/)

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
      address: [
        '',
        [
          Validators.required,
          Validators.pattern(/^(?!\d+$)[A-Za-z0-9\s\-\:\/\,\.]+$/)
        ]
      ],
      city: ['', Validators.required],
      state: ['', Validators.required],
      country: ['', Validators.required],
      pincode: [
        '',
        Validators.pattern(/^[A-Za-z0-9\-\s]{3,10}$/)
      ]
    }, {
      validators: this.countryPhoneValidator.bind(this)
    });

    /* Dynamic phone validation */
    this.contactForm.get('phoneCode')?.valueChanges.subscribe(code => {
      const phoneControl = this.contactForm.get('phone');

      if (code === '+91') {
        phoneControl?.setValidators([
          Validators.required,
          Validators.pattern(/^[3-9][0-9]{9}$/)
        ]);
      } else {
        phoneControl?.setValidators([
          Validators.required,
          Validators.pattern(/^(?!0+$)[0-9]{6,15}$/)
        ]);
      }

      phoneControl?.updateValueAndValidity();
    });
  }

  ngOnInit() {
    this.loadCountries();

    if (this.initialData) {
      if (this.initialData.phone) {
        const [code, number] = this.initialData.phone.split(' ');
        this.contactForm.patchValue({
          ...this.initialData,
          phoneCode: code,
          phone: number
        });
      } else {
        this.contactForm.patchValue(this.initialData);
      }
    }
  }

  /* ===========================
     LOAD COUNTRIES
  =========================== */
  loadCountries() {
    this.http.get<any[]>(`${this.baseUrl}/countries`)
      .subscribe(data => {
        this.countries = data;

        this.phoneCountries = data.map((c: any) => ({
          name: c.name,
          code: c.phonecode || c.phone_code || '',
          flag: '',
          searchLabel: `${c.name} +${c.phonecode || c.phone_code}`
        }));
      });
  }

  /* ===========================
     COUNTRY CHANGE
  =========================== */
  onCountryChange() {
    const selectedCountry = this.contactForm.get('country')?.value;

    this.states = [];
    this.cities = [];

    this.contactForm.patchValue({
      state: '',
      city: ''
    });

    if (!selectedCountry) return;

    this.http.get<any[]>(`${this.baseUrl}/states/${selectedCountry.iso2}`)
      .subscribe(res => {
        this.states = res;
      });
  }

  /* ===========================
     STATE CHANGE
  =========================== */
  onStateChange() {
    const selectedCountry = this.contactForm.get('country')?.value;
    const selectedState = this.contactForm.get('state')?.value;

    this.cities = [];
    this.contactForm.patchValue({ city: '' });

    if (!selectedCountry || !selectedState) return;

    this.http.get<any[]>(
      `${this.baseUrl}/cities/${selectedCountry.iso2}/${selectedState.iso2}`
    ).subscribe(res => {
      this.cities = res;
    });
  }

  /* ===========================
     PINCODE VALIDATION
  =========================== */
  validatePincode() {

  const control = this.contactForm.get('pincode');
  const pincode = control?.value;

  if (!pincode || pincode.length < 5) return;

  //  CLEAR OLD ERRORS FIRST
  control?.setErrors(null);

  this.pincodeService.validate(pincode)
    .subscribe({
      next: (res: any) => {

        console.log("API RESPONSE:", res);

        if (!res || !res.country) {
          control?.setErrors({ invalidPincode: true });
          return;
        }

        const apiCountry = res.country;
        const apiState = res.state;
        const apiCity = res.city;

        const selectedCountry = this.contactForm.get('country')?.value;
        const selectedState = this.contactForm.get('state')?.value;
        const selectedCity = this.contactForm.get('city')?.value;

        const normalize = (val: string) =>
          val?.toLowerCase().replace(/\s/g, '');

        //  COUNTRY CHECK
        if (selectedCountry &&
            normalize(apiCountry) !== normalize(selectedCountry.name)) {
          control?.setErrors({ ...control.errors, invalidCountry: true });
          return;
        }

        //  STATE CHECK
        if (selectedState &&
            normalize(apiState) !== normalize(selectedState.name)) {
          control?.setErrors({ ...control.errors, invalidState: true });
          return;
        }

        //  CITY CHECK
        if (selectedCity && apiCity &&
            normalize(apiCity) !== normalize(selectedCity.name)) {
          control?.setErrors({ ...control.errors, invalidCity: true });
          return;
        }

        //  SUCCESS → CLEAR EVERYTHING
        control?.setErrors(null);
      },

      error: (err) => {
        console.error("API ERROR:", err);
        control?.setErrors({ invalidPincode: true });
      }
    });
}
  /* ===========================
     PHONE VALIDATOR
  =========================== */
  countryPhoneValidator(group: FormGroup) {
    const country = group.get('country')?.value;
    const phoneCode = group.get('phoneCode')?.value;
    const phoneControl = group.get('phone');

    if (country && country.phonecode !== phoneCode) {
      phoneControl?.setErrors({
        ...(phoneControl.errors || {}),
        countryMismatch: true
      });
    } else {
      if (phoneControl?.errors) {
        const { countryMismatch, ...others } = phoneControl.errors;
        phoneControl.setErrors(Object.keys(others).length ? others : null);
      }
    }
    return null;
  }

  /* ===========================
     PHONE INPUT FILTER
  =========================== */
  allowOnlyNumbers(event: any) {
    let value = event.target.value.replace(/[^0-9]/g, '');
    if (/^0+$/.test(value)) value = '';
    this.contactForm.get('phone')?.setValue(value);
  }

  /* ===========================
     SUBMIT
  =========================== */
  submit() {
    if (this.contactForm.valid) {
      const form = this.contactForm.value;
      const fullPhone = form.phoneCode + ' ' + form.phone;

      this.next.emit({
        ...form,
        phone: fullPhone
      });
    } else {
      this.contactForm.markAllAsTouched();
    }
  }

  previousStep() {
    this.previous.emit();
  }
}
