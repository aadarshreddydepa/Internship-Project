import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { NgSelectModule } from '@ng-select/ng-select';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { take } from 'rxjs/operators';

import { HoursComponent } from '../business/hours/hours.component';
import { PhotoUploadComponent } from '../business/photo-upload/photo-upload.component';
import { PreviewComponent } from '../business/preview/preview.component';
import { BusinessLocationService } from '../services/business-location.service';
import { BusinessPincodeService } from '../services/business-pincode.service';

@Component({
  selector: 'app-edit-business',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    NgSelectModule,
    HoursComponent,
    PhotoUploadComponent,
    PreviewComponent
  ],
  templateUrl: './edit-business.component.html',
  styleUrls: ['./edit-business.component.css']
})
export class EditBusinessComponent implements OnInit {

  currentStep = 1;
  businessForm!: FormGroup;

  businessId!: number;

  businessData: any;
  contactData: any = {};
  hoursData: any = [];
  photoData: string | null = null;

  submitSuccessMessage = '';
  hoursErrorMessage = '';
  pincodeError: string = '';

  // Location data from API
  countries: any[] = [];
  states: any[] = [];
  cities: any[] = [];
  phoneCountries: any[] = [];

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
    private http: HttpClient,
    private locationService: BusinessLocationService,
    private pincodeService: BusinessPincodeService,
    @Inject(PLATFORM_ID) private platformId: Object
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
    // Load countries from cache/API
    this.loadCountriesCache();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.businessId = +id;
      // Wait for countries to load before loading business data
      this.loadCountriesCache$.pipe(take(1)).subscribe(() => {
        this.loadBusinessData(this.businessId);
      });
    }
  }

  private normalizeString(val: string): string {
    return val?.toLowerCase().replace(/\s/g, '');
  }

  // CACHE: Load countries from API with cache-aside pattern
  private loadCountriesCache$ = new Subject<void>();
  
  private loadCountriesCache() {
    this.locationService.getCountries()
      .subscribe((data: any[]) => {
        console.log('Countries loaded:', data);
        console.log('First country:', data[0]);
        this.countries = data;
        this.phoneCountries = data.map((c: any) => ({
          name: c.name,
          code: c.phonecode?.startsWith('+') ? c.phonecode : `+${c.phonecode || ''}`,
          flag: '',
          searchLabel: `${c.name} +${c.phonecode || c.phone_code}`
        }));
        console.log('Countries array set:', this.countries.length);
        this.loadCountriesCache$.next();
        this.loadCountriesCache$.complete();
      });
  }

  // Handle country change - load states and update phone code
  onCountryChange() {
    const selectedCountryObj = this.contactData.country;

    this.states = [];
    this.cities = [];
    this.contactData.state = null;
    this.contactData.city = null;
    this.contactData.pincode = '';

    if (!selectedCountryObj) return;

    // Auto-update phone code based on selected country
    const phoneCode = selectedCountryObj.phonecode || selectedCountryObj.phone_code || '';
    if (phoneCode) {
      const formattedPhoneCode = phoneCode.startsWith('+') ? phoneCode : `+${phoneCode}`;
      this.contactData.phoneCode = formattedPhoneCode;
    }

    // Load states from API using iso2 code
    const countryCode = selectedCountryObj.iso2 || '';
    if (countryCode) {
      this.locationService.getStates(countryCode)
        .subscribe(res => {
          this.states = res;
        });
    }
  }

  // Handle state change - load cities
  onStateChange() {
    const selectedCountryObj = this.contactData.country;
    const selectedStateObj = this.contactData.state;

    this.cities = [];
    this.contactData.city = null;
    this.contactData.pincode = '';

    if (!selectedCountryObj || !selectedStateObj) return;

    const countryCode = selectedCountryObj.iso2 || '';
    const stateCode = selectedStateObj.iso2 || '';

    if (countryCode && stateCode) {
      this.locationService.getCities(countryCode, stateCode)
        .subscribe(res => {
          this.cities = res;
        });
    }
  }

  // Pincode validation via API
  validatePincode() {
    const pincode = this.contactData.pincode;

    if (!pincode || pincode.length < 5) {
      this.pincodeError = '';
      return;
    }

    this.pincodeService.validate(pincode)
      .subscribe({
        next: (res: any) => {
          if (!res || !res.country) {
            this.pincodeError = 'Invalid pincode';
            return;
          }

          const apiCountry = res.country;
          const apiState = res.state;
          const apiCity = res.city;

          const selectedCountry = this.contactData.country?.name;
          const selectedState = this.contactData.state?.name;
          const selectedCity = this.contactData.city?.name;

          // Country check
          if (selectedCountry &&
              this.normalizeString(apiCountry) !== this.normalizeString(selectedCountry)) {
            this.pincodeError = 'Pincode does not match selected country';
            return;
          }

          // State check
          if (selectedState &&
              this.normalizeString(apiState) !== this.normalizeString(selectedState)) {
            this.pincodeError = 'Pincode does not match selected state';
            return;
          }

          // City check
          if (selectedCity && apiCity &&
              this.normalizeString(apiCity) !== this.normalizeString(selectedCity)) {
            this.pincodeError = 'Pincode does not match selected city';
            return;
          }

          // Success
          this.pincodeError = '';
        },
        error: (err) => {
          console.error("Pincode validation error:", err);
          this.pincodeError = 'Invalid pincode';
        }
      });
  }

  // Load business data from backend with proper object mapping for location fields
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

        // Parse phone into code and number
        let phoneCode = '+91';
        let phoneNumber = '';
        if (res.phone) {
          const phoneParts = res.phone.split(' ');
          if (phoneParts.length >= 2) {
            phoneCode = phoneParts[0];
            phoneNumber = phoneParts.slice(1).join(' ');
          } else {
            phoneNumber = res.phone;
          }
        }

        // Ensure phoneCode has + prefix
        if (!phoneCode.startsWith('+')) {
          phoneCode = '+' + phoneCode;
        }

        // Find country object by name from the countries list
        const countryObj = res.country 
          ? this.countries.find(c => this.normalizeString(c.name) === this.normalizeString(res.country))
          : null;

        // Load states first, then set data
        if (countryObj) {
          this.locationService.getStates(countryObj.iso2).subscribe(states => {
            this.states = states;

            // Find state object by name
            const stateObj = res.state
              ? states.find((s: any) => this.normalizeString(s.name) === this.normalizeString(res.state))
              : null;

            // Load cities if state found
            if (stateObj) {
              this.locationService.getCities(countryObj.iso2, stateObj.iso2).subscribe(cities => {
                this.cities = cities;

                // Find city object by name
                const cityObj = res.city
                  ? cities.find((c: any) => this.normalizeString(c.name) === this.normalizeString(res.city))
                  : null;

                // Set all contact data at once after cascading loads complete
                this.contactData = {
                  email: res.email || '',
                  phone: phoneNumber,
                  phoneCode: phoneCode,
                  country: countryObj,
                  state: stateObj || null,
                  city: cityObj || null,
                  streetAddress: res.streetAddress || '',
                  pincode: res.pincode || ''
                };
              });
            } else {
              // No state match found, set data without cities
              this.contactData = {
                email: res.email || '',
                phone: phoneNumber,
                phoneCode: phoneCode,
                country: countryObj,
                state: null,
                city: null,
                streetAddress: res.streetAddress || '',
                pincode: res.pincode || ''
              };
            }
          });
        } else {
          // No country match found, set data with strings only
          this.contactData = {
            email: res.email || '',
            phone: phoneNumber,
            phoneCode: phoneCode,
            country: null,
            state: null,
            city: null,
            streetAddress: res.streetAddress || '',
            pincode: res.pincode || ''
          };
        }
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

  saveContactAndNext() {
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
    if (!this.hoursData || this.hoursData.length === 0) return true;
    return true;
  }

  // Final update API call - extract string values from objects
  submitRegistration() {
    const phoneCode = this.contactData.phoneCode;
    const phone = this.contactData.phone;
    const fullPhone = phone?.startsWith('+') ? phone : `${phoneCode} ${phone}`;

    // Extract string values from objects for backend compatibility
    const countryValue = this.contactData.country?.name || this.contactData.country || '';
    const stateValue = this.contactData.state?.name || this.contactData.state || '';
    const cityValue = this.contactData.city?.name || this.contactData.city || '';

    const payload = {
      ...this.businessData,
      email: this.contactData.email,
      phone: fullPhone,
      country: countryValue,
      state: stateValue,
      city: cityValue,
      streetAddress: this.contactData.streetAddress,
      pincode: this.contactData.pincode
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
