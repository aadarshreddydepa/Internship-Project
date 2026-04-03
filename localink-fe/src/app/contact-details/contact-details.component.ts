import {
  Component,
  EventEmitter,
  Output,
  Input,
  OnInit,
  AfterViewInit,
  OnDestroy,
  PLATFORM_ID,
  Inject
} from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { NgSelectModule } from '@ng-select/ng-select';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Subject, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, catchError } from 'rxjs/operators';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-contact-details',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgSelectModule, FormsModule, TranslateModule],
  templateUrl: './contact-details.component.html',
  styleUrls: ['./contact-details.component.css']
})

export class ContactDetailsComponent implements OnInit, AfterViewInit, OnDestroy {

  contactForm!: FormGroup;

  @Input() initialData: any;

  @Output() next = new EventEmitter<any>();

  @Output() previous = new EventEmitter<void>();

  phoneCountries: any[] = [];

  countries: any[] = [];

  states: string[] = [];

  // Map related
  private map: any;
  private marker: any;
  private L: any;

  isLoadingLocation = false;
  locationError = '';
  searchQuery = '';
  selectedLat: number | null = null;
  selectedLng: number | null = null;
  isGeocodingAddress = false;

  // Autocomplete search
  searchQuerySubject = new Subject<string>();
  searchResults: any[] = [];
  isSearching = false;
  showDropdown = false;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {

    this.contactForm = this.fb.group({

      phoneCode: ['+91', Validators.required],

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

      address: ['', [
        Validators.required,
        Validators.minLength(5),
        Validators.maxLength(200)
      ]],

      city: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50),
        Validators.pattern(/^[a-zA-Z\s.-]+$/)
      ]],

      state: ['', Validators.required],

      country: ['', Validators.required],

      pincode: [
        '',
        [Validators.required, Validators.pattern(/^[1-9][0-9]{5}$/)]
      ],

      latitude: [null],
      longitude: [null]

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
    this.http.get<any>('assets/data/countries.json')
      .subscribe(data => {
        this.countries = data;

        this.phoneCountries = data.map((c: any) => ({
          name: c.name,
          code: c.code,
          flag: c.flag
        }));

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

          const countryObj = this.countries.find(
            c => c.name === this.initialData.country
          );
          this.states = countryObj ? countryObj.states.map((s: any) => s.name) : [];

          // Restore map pin if coordinates exist
          if (this.initialData.latitude && this.initialData.longitude) {
            this.selectedLat = this.initialData.latitude;
            this.selectedLng = this.initialData.longitude;
          }
        }
      });

    // Setup auto-search observable
    this.searchQuerySubject.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      switchMap(query => {
        if (!query.trim()) {
          this.searchResults = [];
          this.showDropdown = false;
          return of([]);
        }
        this.isSearching = true;
        const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5`;
        return this.http.get<any[]>(url, { headers: { 'Accept-Language': 'en' } }).pipe(
          catchError(() => {
            this.locationError = 'Auto-search failed.';
            return of([]);
          })
        );
      })
    ).subscribe(results => {
      this.isSearching = false;
      this.searchResults = results || [];
      this.showDropdown = this.searchResults.length > 0;
    });
  }

  async ngAfterViewInit() {
    if (!isPlatformBrowser(this.platformId)) return;

    // Dynamically import leaflet to avoid SSR issues
    this.L = await import('leaflet');

    // Fix default marker icon paths broken by webpack
    delete (this.L.Icon.Default.prototype as any)._getIconUrl;
    this.L.Icon.Default.mergeOptions({
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });

    // Use setTimeout(0) so the map initialises AFTER Angular finishes
    // rendering the DOM — without this Leaflet miscalculates container
    // dimensions when inside an *ngIf and only renders a partial tile set.
    setTimeout(() => {
      // Initialize map centered on India
      this.map = this.L.map('leaflet-map', {
        center: [20.5937, 78.9629],
        zoom: 5
      });

      this.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
      }).addTo(this.map);

      // Force the map to recalculate its container size
      this.map.invalidateSize();

      // If we already have coordinates (returning to step), place marker
      if (this.selectedLat && this.selectedLng) {
        this.placeMarker(this.selectedLat, this.selectedLng);
        this.map.setView([this.selectedLat, this.selectedLng], 15);
      }

      // Map click handler
      this.map.on('click', (e: any) => {
        const { lat, lng } = e.latlng;
        this.placeMarker(lat, lng);
        this.reverseGeocode(lat, lng);
      });
    }, 0);
  }

  ngOnDestroy() {
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
  }

  // ---- MAP HELPERS ----

  private placeMarker(lat: number, lng: number) {
    this.selectedLat = lat;
    this.selectedLng = lng;

    if (this.marker) {
      this.marker.setLatLng([lat, lng]);
    } else {
      this.marker = this.L.marker([lat, lng], { draggable: true }).addTo(this.map);

      this.marker.on('dragend', () => {
        const pos = this.marker.getLatLng();
        this.selectedLat = pos.lat;
        this.selectedLng = pos.lng;
        this.reverseGeocode(pos.lat, pos.lng);
      });
    }

    this.contactForm.patchValue({ latitude: lat, longitude: lng });
  }

  // ---- CURRENT LOCATION ----

  useCurrentLocation() {
    if (!isPlatformBrowser(this.platformId)) return;

    if (!navigator.geolocation) {
      this.locationError = 'Geolocation is not supported by your browser.';
      return;
    }

    this.isLoadingLocation = true;
    this.locationError = '';

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        this.map.flyTo([lat, lng], 16, { animate: true, duration: 1.5 });
        this.placeMarker(lat, lng);
        this.reverseGeocode(lat, lng);
        this.isLoadingLocation = false;
      },
      (error) => {
        this.isLoadingLocation = false;
        switch (error.code) {
          case error.PERMISSION_DENIED:
            this.locationError = 'Location access denied. Please allow permission in your browser.';
            break;
          case error.POSITION_UNAVAILABLE:
            this.locationError = 'Location information is unavailable.';
            break;
          case error.TIMEOUT:
            this.locationError = 'Location request timed out.';
            break;
          default:
            this.locationError = 'An error occurred while retrieving your location.';
        }
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  }

  // ---- REVERSE GEOCODING ----

  reverseGeocode(lat: number, lng: number) {
    this.isGeocodingAddress = true;

    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`;

    this.http.get<any>(url, {
      headers: { 'Accept-Language': 'en' }
    }).subscribe({
      next: (data) => {
        this.isGeocodingAddress = false;
        const addr = data.address;

        if (!addr) return;

        const countryName = addr.country || '';
        const stateName = addr.state || addr.region || '';
        const cityName = addr.city || addr.town || addr.village || addr.county || '';
        const postcode = addr.postcode || '';
        const streetParts = [
          addr.road || addr.street,
          addr.house_number,
          addr.suburb,
          addr.neighbourhood
        ].filter(Boolean);
        const streetAddress = streetParts.join(', ') || data.display_name || '';

        // Check if country exists in our list
        const countryObj = this.countries.find(
          c => c.name.toLowerCase() === countryName.toLowerCase()
        );
        const matchedCountry = countryObj ? countryObj.name : countryName;

        if (countryObj) {
          this.states = countryObj.states.map((s: any) => s.name) || [];
        }

        // Find matching state
        const matchedState = this.states.find(
          (s: string) => s.toLowerCase() === stateName.toLowerCase()
        ) || stateName;

        this.contactForm.patchValue({
          country: matchedCountry,
          state: matchedState,
          city: cityName,
          pincode: postcode.replace(/\s/g, '').slice(0, 6),
          address: streetAddress.slice(0, 200)
        });

        // Update phone code to match country if not manually changed
        if (countryObj && countryObj.code) {
          const currentPhoneCode = this.contactForm.get('phoneCode')?.value;
          if (!currentPhoneCode || currentPhoneCode === '+91') {
            this.contactForm.patchValue({ phoneCode: countryObj.code });
          }
        }
      },
      error: () => {
        this.isGeocodingAddress = false;
        this.locationError = 'Could not fetch address for this location.';
      }
    });
  }

  // ---- FORWARD GEOCODING / SEARCH ----

  onSearchQueryChange(query: string) {
    this.searchQuerySubject.next(query);
  }

  selectSearchResult(result: any) {
    this.showDropdown = false;
    this.searchQuery = result.display_name;
    const lat = parseFloat(result.lat);
    const lon = parseFloat(result.lon);

    this.map.flyTo([lat, lon], 15, { animate: true, duration: 1.5 });
    this.placeMarker(lat, lon);
    this.reverseGeocode(lat, lon);
    this.locationError = '';
  }

  // Click outside dropdown or focus out
  closeDropdown() {
    setTimeout(() => {
      this.showDropdown = false;
    }, 200);
  }

  searchLocation() {
    if (!this.searchQuery.trim()) return;

    this.showDropdown = false;
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(this.searchQuery)}&format=json&limit=1`;

    this.http.get<any[]>(url, {
      headers: { 'Accept-Language': 'en' }
    }).subscribe({
      next: (results) => {
        if (results && results.length > 0) {
          const { lat, lon } = results[0];
          const latitude = parseFloat(lat);
          const longitude = parseFloat(lon);

          this.map.flyTo([latitude, longitude], 15, { animate: true, duration: 1.5 });
          this.placeMarker(latitude, longitude);
          this.reverseGeocode(latitude, longitude);
          this.locationError = '';
        } else {
          this.locationError = 'No results found for that location. Try a different search.';
        }
      },
      error: () => {
        this.locationError = 'Search failed. Please try again.';
      }
    });
  }

  onSearchKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      event.preventDefault(); // Prevent form submission
      this.searchLocation();
    }
  }

  // ---- EXISTING METHODS ----

  onCountryChange() {

    const selectedCountry = this.contactForm.get('country')?.value;

    const countryObj = this.countries.find(
      c => c.name === selectedCountry
    );

    this.states = countryObj ? countryObj.states.map((s: any) => s.name) : [];

    this.contactForm.get('state')?.setValue('');

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