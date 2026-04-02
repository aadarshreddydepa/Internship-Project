import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProfileComponent } from '../../pages/profile/profile.component';
import { ClientDashboardService } from '../../services/client-dashboard.service';
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
  imports: [CommonModule, FormsModule, ProfileComponent],
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

  countries: any[] = [];
  states: string[] = []; 
  selectedCountry: any = null;

  constructor(
    private router: Router,
    private dashboardService: ClientDashboardService,
    private notificationService: NotificationService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}
  toggleProfile(): void {
    this.showProfile = true;
  }

  closeProfile(): void {
    this.showProfile = false;
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  ngOnInit() {
    if (!isPlatformBrowser(this.platformId)) return;

    this.fetchBusinesses();
    this.loadCategories();

    fetch('assets/countries.json')
      .then(res => res.json())
      .then(data => this.countries = data);
  }

  fetchBusinesses() {
    const userId = 2;

  fetchBusinesses() {
    this.dashboardService.getBusinessesByUser()
      .subscribe({
        next: (res: any[]) => {

          this.setUserName();

          this.businesses = res.map((b: any) => ({
            id: b.id,
            businessName: b.name,
            category: b.categoryName?.toLowerCase(),
            subcategory: b.subcategoryName,
            status: b.status ?? 'Pending',
            description: b.description,
            contact: {
              phone: (b.phoneNumber || '').replace(/^\+\d+\s*/, ''),
              email: b.email || '',
              city: b.city || '',
              state: b.state || '',
              streetAddress: b.streetAddress || '',
              country: b.country || '',
              pincode: b.pincode || ''
            }
          }));

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

    this.dashboardService.getPhotos(id)
      .subscribe((res: any[]) => {
        this.selectedPhotos = res;
      });

    const categoryObj = this.categories.find(
      c => c.name.toLowerCase() === this.editingBusiness?.category
    );

    if (categoryObj) {
      this.loadSubcategories(categoryObj.id);
    }

    if (this.editingBusiness?.contact.country) {
      this.selectedCountry = this.countries.find(
        c => c.name === this.editingBusiness!.contact.country
      );

      if (this.selectedCountry) {
        this.states = this.selectedCountry.states.map((s: any) => s.name);
      }
    }
  }

  loadSubcategories(categoryId: number) {
    this.dashboardService.getSubcategories(categoryId)
      .subscribe((res: any[]) => {
        this.filteredSubcategories = res;
      });
  }

  onCategoryChange(category: string) {
    const categoryObj = this.categories.find(
      c => c.name.toLowerCase() === category
    );

    if (categoryObj) {
      this.loadSubcategories(categoryObj.id);
    }
  }

  onCountryChange(countryName: string) {
    this.selectedCountry = this.countries.find(c => c.name === countryName);

    this.states = this.selectedCountry
      ? this.selectedCountry.states.map((s: any) => s.name)
      : [];

       if (this.editingBusiness && this.selectedCountry) {
          this.editingBusiness.contact.phoneCode = this.selectedCountry.code;
        }
    if (this.editingBusiness) {
      this.editingBusiness.contact.state = '';
    }
  }

  getPhonePattern(): string {
    if (!this.selectedCountry) return '^[0-9]{6,12}$';

    if (this.selectedCountry.code === '+91') return '^[6-9][0-9]{9}$';
    if (this.selectedCountry.code === '+1') return '^[0-9]{10}$';

    return '^[0-9]{6,12}$';
  }

  getPincodePattern(): string {
    if (!this.selectedCountry) return '^[0-9]{4,10}$';
    return `^[0-9]{${this.selectedCountry.pincodeLength}}$`;
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  uploadImage() {
    if (!this.selectedFile || !this.editingBusiness) return;

    this.dashboardService.uploadPhoto(
      this.editingBusiness.id,
      this.selectedFile
    )
    .subscribe(() => {
      this.dashboardService.getPhotos(this.editingBusiness!.id)
        .subscribe((res: any[]) => {
          this.selectedPhotos = res;
        });

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

    const payload = {
      businessName: this.editingBusiness.businessName,
      description: this.editingBusiness.description,
      categoryId: categoryObj?.id,
      subcategoryId: subcategoryObj?.id,
      phoneCode: this.selectedCountry?.code || '',
      phoneNumber: this.editingBusiness.contact.phone,
      email: this.editingBusiness.contact.email,
      city: this.editingBusiness.contact.city,
      streetAddress: this.editingBusiness.contact.streetAddress,
      state: this.editingBusiness.contact.state,
      country: this.editingBusiness.contact.country,
      pincode: this.editingBusiness.contact.pincode
    };

    this.dashboardService.updateBusiness(this.editingBusiness.id, payload)
      .subscribe({
        next: () => {
          this.fetchBusinesses();
          this.editingBusiness = null;
        },
        error: (err) => {
          console.error(err);
        }
      });
  }

  cancelEdit() {
    this.editingBusiness = null;
  }

  viewBusiness(id: number) {
    this.selectedBusiness = this.businesses.find(b => b.id === id) || null;

    this.dashboardService.getPhotos(id)
      .subscribe((res: any[]) => {
        this.selectedPhotos = res;
      });
  }

  closeView() {
    this.selectedBusiness = null;
  }
}