import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgSelectModule } from '@ng-select/ng-select';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';

import { ContactDetailsComponent } from '../contact-details/contact-details.component';
import { HoursComponent } from '../business/hours/hours.component';
import { PhotoUploadComponent } from '../business/photo-upload/photo-upload.component';
import { PreviewComponent } from '../business/preview/preview.component';
import { BusinessLocationService } from '../services/business-location.service';
import { BusinessPincodeService } from '../services/business-pincode.service';

@Component({
  selector: 'app-register-business',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NgSelectModule,
    ContactDetailsComponent,
    HoursComponent,
    PhotoUploadComponent,
    PreviewComponent
  ],
  templateUrl: './edit-business.component.html',
  styleUrls: ['./edit-business.component.css']
})
export class EditBusinessBusinessComponent implements OnInit {

  currentStep = 1;
  businessForm!: FormGroup;

  businessId!: number;

  businessData: any;
  contactData: any;
  hoursData: any = [];
  photoData: string | null = null;

  submitSuccessMessage = '';
  hoursErrorMessage = '';

  // 🌍 LOCATION DATA (cached from contact-details pattern)
  countries: any[] = [];
  states: any[] = [];
  cities: any[] = [];
  phoneCountries: any[] = [];
  selectedCountryCode: string = '';
  selectedStateCode: string = '';
  pincodeError: string = '';

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
    private pincodeService: BusinessPincodeService
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
    // ✅ Load countries from cache/local JSON (same as contact-details)
    this.loadCountriesCache();

    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.businessId = +id;
      // Wait for countries to load before loading business data
      this.loadCountriesCache$.subscribe(() => {
        this.loadBusinessData(this.businessId);
      });
    }
  }

  // 🌍 CACHE: Load countries from local JSON (cached data)
  private loadCountriesCache$ = new Subject<void>();
  
  private loadCountriesCache() {
    this.http.get<any>('assets/data/countries.json')
      .subscribe(data => {
        this.countries = data;
        this.phoneCountries = data.map((c: any) => ({
          name: c.name,
          code: c.code?.startsWith('+') ? c.code : `+${c.code || c.phonecode || ''}`,
          flag: c.flag
        }));
        this.loadCountriesCache$.next();
        this.loadCountriesCache$.complete();
      });
  }

  // 🌍 CACHE: Get states from API with cache-aside pattern via service
  getStates(countryCode: string) {
    this.locationService.getStates(countryCode).subscribe(states => {
      this.states = states;
    });
  }

  // 🌍 CACHE: Get cities from API with cache-aside pattern via service
  getCities(countryCode: string, stateCode: string) {
    this.locationService.getCities(countryCode, stateCode).subscribe(cities => {
      this.cities = cities;
    });
  }

  // 🌍 Handle country change - updates states and phone code
  onCountryChange(countryName: string) {
    const country = this.countries.find(c => c.name === countryName);
    if (!country) return;

    this.selectedCountryCode = country.iso2;
    this.getStates(this.selectedCountryCode);
    this.cities = [];

    // Update phone code in contact data if available
    if (this.contactData) {
      const rawCode = country.phonecode || '';
      this.contactData.phoneCode = rawCode.startsWith('+') ? rawCode : `+${rawCode}`;
    }
  }

  // 🌍 Handle state change - updates cities
  onStateChange(stateName: string) {
    const state = this.states.find(s => s.name === stateName);
    if (!state) return;

    this.selectedStateCode = state.iso2;
    this.getCities(this.selectedCountryCode, this.selectedStateCode);

    // Reset city in contact data
    if (this.contactData) {
      this.contactData.city = '';
    }
  }

  // 📮 CACHE: Validate pincode using cached service
  validatePincode(pincode: string) {
    if (!pincode) return;

    this.pincodeService.validate(pincode).subscribe({
      next: (isValid: boolean) => {
        if (!isValid) {
          this.pincodeError = 'Invalid pincode';
        } else {
          this.pincodeError = '';
        }
      },
      error: () => {
        // Silently fail on error
      }
    });
  }

  // 📮 Clear pincode error
  clearPincodeError() {
    this.pincodeError = '';
  }

  // ✅ LOAD FROM BACKEND
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

        // ✅ FIXED: Parse phone into code and number
        let phoneCode = '';
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

        // ✅ FIXED: Set phone code from country if available
        if (res.country && !phoneCode) {
          const country = this.countries.find(c => c.name === res.country);
          if (country) {
            const rawCode = country.code || country.phonecode || '';
            phoneCode = rawCode.startsWith('+') ? rawCode : `+${rawCode}`;
          }
        }

        this.contactData = {
          email: res.email,
          city: res.city,
          phone: phoneNumber,
          phoneCode: phoneCode,
          country: res.country,
          state: res.state,
          streetAddress: res.streetAddress,
          pincode: res.pincode
        };

        // ✅ Load states and cities if country exists
        if (res.country) {
          this.onCountryChange(res.country);
          if (res.state) {
            setTimeout(() => this.onStateChange(res.state), 100);
          }
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

  saveContactAndNext(data: any) {
    this.contactData = data;
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
    if (!this.hoursData || this.hoursData.length === 0) return true; // relaxed
    return true;
  }

  // ✅ FINAL UPDATE API CALL
  submitRegistration() {

    const payload = {
      ...this.businessData,
      ...this.contactData
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