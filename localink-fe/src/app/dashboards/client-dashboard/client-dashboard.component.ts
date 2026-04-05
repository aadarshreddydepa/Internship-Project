import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { ProfileComponent } from '../../pages/profile/profile.component';
import { ClientDashboardService } from '../../services/client-dashboard.service';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageSwitcherComponent } from '../../components/language-switcher/language-switcher.component';
import { BusinessLocationService } from '../../services/business-location.service';
import { BusinessPincodeService } from '../../services/business-pincode.service';
import { NotificationService } from '../../services/notification.service';

interface Business {
  id: number;
  businessName: string;
  category: string;
  subcategory: string;
  status: string;
  description?: string;
  contact: {
    phone: string;
    email: string;
    city: string;
    streetAddress?: string;
    state?: string;
    country?: string;
    pincode?: string;
    phoneCode?: string;
  };
}

@Component({
  selector: 'app-client-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NgSelectModule, ProfileComponent, TranslateModule, LanguageSwitcherComponent],
  templateUrl: './client-dashboard.component.html',
  styleUrls: ['./client-dashboard.component.css']
})
export class ClientDashboardComponent implements OnInit {

  businesses: Business[] = [];
  selectedBusiness: Business | null = null;
  editingBusiness: Business | null = null;
  showProfile = false;
  categories: any[] = [];
  filteredSubcategories: any[] = [];

  selectedPhotos: any[] = [];
  selectedFile: File | null = null;

  isLoading = true;
  fullName: string = '';
  liveNotification: string | null = null;

  // 🌍 LOCATION DATA
  countries: any[] = [];
  phoneCountries: any[] = [];
  states: any[] = [];
  cities: any[] = [];

  selectedCountryCode: string = '';
  selectedStateCode: string = '';

  constructor(
    private router: Router,
    private dashboardService: ClientDashboardService,
    private locationService: BusinessLocationService,
    private pincodeService: BusinessPincodeService,
    private notificationService: NotificationService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    if (!isPlatformBrowser(this.platformId)) return;

    this.fetchBusinesses();
    this.loadCategories();

    // Load countries from standardized service (CACHED)
    this.locationService.getCountries().subscribe(res => {
      this.countries = res;
      this.phoneCountries = res.map((c: any) => ({
        name: c.name,
        code: '+' + (c.phonecode || c.phone_code || ''),
        flag: '',
        searchLabel: `${c.name} +${c.phonecode || c.phone_code}`
      }));
    });
  }

  toggleProfile() { this.showProfile = true; }
  closeProfile() { this.showProfile = false; }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  loadCategories() {
    this.dashboardService.getCategories().subscribe({
      next: (data: any) => {
        this.categories = data;
      }
    });
  }

  fetchBusinesses() {
    this.dashboardService.getBusinessesByUser().subscribe({
      next: (res: any[]) => {

        this.setUserName();

        this.businesses = res.map((b: any) => {
          let pCode = b.phoneCode || '';
          if (pCode && !pCode.startsWith('+')) pCode = '+' + pCode;

          let pNum = (b.phoneNumber || '').trim();
          if (pCode && pNum.startsWith(pCode)) {
            pNum = pNum.substring(pCode.length).trim();
          } else if (b.phoneCode && pNum.startsWith(b.phoneCode)) {
            pNum = pNum.substring(b.phoneCode.length).trim();
          }
          // Remove any leftover non-digit separators at the start
          pNum = pNum.replace(/^[\s\+\-]+/, '').trim();

          return {
            id: b.id,
            businessName: b.name,
            category: b.categoryName?.toLowerCase(),
            subcategory: b.subcategoryName,
            status: b.status ?? 'Pending',
            description: b.description,
            contact: {
              phone: pNum,
              phoneCode: pCode,
              email: b.email || '',
              city: b.city || '',
              state: b.state || '',
              streetAddress: b.streetAddress || '',
              country: b.country || '',
              pincode: b.pincode || ''
            }
          };
        });

        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }

  setUserName() {
    this.dashboardService.getUserProfile().subscribe({
      next: (res) => {
        this.fullName = res.fullName;
        if (res.userId) {
          this.notificationService.startConnection(res.userId.toString());
          this.notificationService.notification$.subscribe(msg => {
            this.liveNotification = msg;
            setTimeout(() => this.liveNotification = null, 6000);
          });
        }
      },
      error: () => {
        this.fullName = 'User';
      }
    });
  }

  ngOnDestroy() {
    this.notificationService.stopConnection();
  }

  trackById(index: number, item: Business) {
    return item.id;
  }

  addBusiness() {
    this.router.navigate(['/register-business']);
  }

  editBusiness(id: number) {
    const business = this.businesses.find(b => b.id === id);
    if (!business) return;

    this.editingBusiness = JSON.parse(JSON.stringify(business));

    this.dashboardService.getPhotos(id).subscribe((res: any[]) => {
      this.selectedPhotos = res;
    });

    // Load subcategories
    const categoryObj = this.categories.find(
      c => c.name.toLowerCase() === this.editingBusiness?.category
    );
    if (categoryObj) this.loadSubcategories(categoryObj.id);

    // LOAD COUNTRY → STATE → CITY (FIXED)
    if (this.editingBusiness?.contact.country) {
      const country = this.countries.find(
        c => c.name === this.editingBusiness!.contact.country
      );

      if (country) {
        this.selectedCountryCode = country.iso2;
        this.locationService.getStates(this.selectedCountryCode)
          .subscribe((states: any[]) => {
            this.states = states;

            const state = states.find(
              s => s.name === this.editingBusiness!.contact.state
            );

            if (state) {
              this.selectedStateCode = state.iso2;
              this.locationService.getCities(
                this.selectedCountryCode,
                this.selectedStateCode
              ).subscribe((cities: any[]) => {
                this.cities = cities;
              });
            }
          });
      }
    }
  }

  loadSubcategories(categoryId: number) {
    this.dashboardService.getSubcategories(categoryId)
      .subscribe((res: any[]) => this.filteredSubcategories = res);
  }

  onCategoryChange(category: string) {
    const categoryObj = this.categories.find(
      c => c.name.toLowerCase() === category
    );
    if (categoryObj) this.loadSubcategories(categoryObj.id);
  }

  // COUNTRY CHANGE
  onCountryChange(countryName: string) {
    const country = this.countries.find(c => c.name === countryName);
    if (!country) return;

    this.selectedCountryCode = country.iso2;

    this.locationService.getStates(this.selectedCountryCode)
      .subscribe(res => {
        this.states = res;
        this.cities = [];
      });

    if (this.editingBusiness) {
      this.editingBusiness.contact.state = '';
      this.editingBusiness.contact.city = '';
      this.editingBusiness.contact.phoneCode = '+' + country.phonecode;
    }
  }

  // STATE CHANGE
  onStateChange(stateName: string) {
    const state = this.states.find(s => s.name === stateName);
    if (!state) return;

    this.selectedStateCode = state.iso2;

    this.locationService.getCities(
      this.selectedCountryCode,
      this.selectedStateCode
    ).subscribe(res => this.cities = res);

    if (this.editingBusiness) {
      this.editingBusiness.contact.city = '';
    }
  }

  pincodeError: string = '';

  onPincodeChange() {
    const eb = this.editingBusiness;
    if (!eb) return;

    const pincode = eb.contact.pincode;
    if (!pincode) return;

    // Preserve address
    const existingAddress = eb.contact.streetAddress;

    // Reset old values (IMPORTANT)
    eb.contact.state = '';
    eb.contact.city = '';
    this.states = [];
    this.cities = [];
    this.pincodeError = '';

    this.pincodeService.validate(pincode)
      .subscribe(res => {

        if (!res || !res.country) {
          this.pincodeError = "Invalid pincode";
          return;
        }

        const countryName = res.country;
        const stateName = res.state;
        const cityName = res.city;

        // Set country
        eb.contact.country = countryName || '';


        const country = this.countries.find(
          c => c.name.toLowerCase() === countryName?.toLowerCase()
        );

        if (!country) return;

        this.selectedCountryCode = country.iso2;
        eb.contact.phoneCode = '+' + country.phonecode;

        // Load states
        this.locationService.getStates(this.selectedCountryCode)
          .subscribe((states: any[]) => {

            this.states = states;

            const state = states.find((s: any) =>
              stateName &&
              s.name.toLowerCase().includes(stateName.toLowerCase())
            );

            if (state) {
              eb.contact.state = state.name;
              this.selectedStateCode = state.iso2;

              // Load cities
              this.locationService.getCities(
                this.selectedCountryCode,
                this.selectedStateCode
              ).subscribe((cities: any[]) => {

                this.cities = cities;

                const city = cities.find((c: any) =>
                  cityName &&
                  c.name.toLowerCase().includes(cityName.toLowerCase())
                );

                // ❌ VALIDATION: mismatch check
                if (
                  eb.contact.city &&
                  cityName &&
                  !eb.contact.city.toLowerCase().includes(cityName.toLowerCase())
                ) {
                  this.pincodeError = "Pincode does not match selected city";
                  return;
                }

                eb.contact.city = city
                  ? city.name
                  : cityName || '';

                // ✅ Restore address
                eb.contact.streetAddress = existingAddress;
              });

            } else {
              eb.contact.state = stateName || '';
              eb.contact.city = cityName || '';
              eb.contact.streetAddress = existingAddress;
            }
          });
      });
  }

  getPhonePattern(): string {
    const code = this.editingBusiness?.contact?.phoneCode;
    if (code === '+91') return '^[6-9][0-9]{9}$';
    if (code === '+1') return '^[0-9]{10}$';
    return '^[0-9]{6,12}$';
  }

  // ✅ FIXED PINCODE
  getPincodePattern(): string {
    if (this.editingBusiness?.contact.country === 'India') {
      return '^[0-9]{6}$';
    }
    return '^[0-9]{4,10}$';
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  uploadImage() {
    if (!this.selectedFile || !this.editingBusiness) return;

    this.dashboardService.uploadPhoto(
      this.editingBusiness.id,
      this.selectedFile!
    )
    .subscribe(() => {
      this.dashboardService.getPhotos(this.editingBusiness!.id)
        .subscribe((res: any[]) => this.selectedPhotos = res);

      this.selectedFile = null;
    });
  }

  deleteImage(photoId: number) {
    this.dashboardService.deletePhoto(photoId).subscribe(() => {
      this.selectedPhotos = this.selectedPhotos.filter(p => p.photoId !== photoId);
    });
  }

  saveEdits() {
    if (!this.editingBusiness) return;

    const categoryObj = this.categories.find(
      c => c.name.toLowerCase() === this.editingBusiness!.category
    );

    const subcategoryObj = this.filteredSubcategories.find(
      s => s.name === this.editingBusiness!.subcategory
    );

    // ✅ FIXED PHONE CODE
    const country = this.countries.find(
      c => c.name === this.editingBusiness?.contact?.country
    );

    const payload = {
      businessName: this.editingBusiness!.businessName,
      description: this.editingBusiness!.description,
      categoryId: categoryObj?.id,
      subcategoryId: subcategoryObj?.id,
      phoneCode: this.editingBusiness?.contact?.phoneCode || '',
      phoneNumber: this.editingBusiness!.contact.phone.replace(/\D/g, ''),
      email: this.editingBusiness!.contact.email,
      city: this.editingBusiness!.contact.city,
      streetAddress: this.editingBusiness!.contact.streetAddress,
      state: this.editingBusiness!.contact.state,
      country: this.editingBusiness!.contact.country,
      pincode: this.editingBusiness!.contact.pincode
    };

    this.dashboardService.updateBusiness(this.editingBusiness!.id, payload)
      .subscribe({
        next: () => {
          this.fetchBusinesses();
          this.editingBusiness = null;
        },
        error: (err) => console.error(err)
      });
  }

  cancelEdit() {
    this.editingBusiness = null;
  }

  viewBusiness(id: number) {
    this.selectedBusiness = this.businesses.find(b => b.id === id) || null;

    this.dashboardService.getPhotos(id)
      .subscribe((res: any[]) => this.selectedPhotos = res);
  }

  closeView() {
    this.selectedBusiness = null;
  }
}