import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { ClientDashboardService } from '../../services/client-dashboard.service';

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
  };
}

@Component({
  selector: 'app-client-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './client-dashboard.component.html',
  styleUrls: ['./client-dashboard.component.css']
})
export class ClientDashboardComponent implements OnInit {

  businesses: Business[] = [];
  selectedBusiness: Business | null = null;
  editingBusiness: Business | null = null;

  isLoading = true;
  fullName: string = '';

  //  CATEGORY DATA (YOUR JSON)
  categoriesMap: any = {
    medical: ["Clinic","Pharmacy","Diagnostic Center","Dental Clinic","Eye Care","Physiotherapy"],
    food: ["Restaurant","Cafe","Fast Food","Catering","Bakery","Food Truck"],
    general: ["Supermarket","Convenience Store","Grocery","Department Store","Organic Store","Stationery Store"],
    tutoring: ["Math Tutor","Science Tutor","Language Classes","Music Lessons","Art Classes","Coding Classes"],
    repair: ["Phone Repair","Computer Repair","Appliance Repair","Car Repair","Plumbing","Electrical"],
    home: ["Interior Design","Furniture","Gardening","Cleaning Services","Pest Control","Home Decor"]
  };

  categoryKeys: string[] = Object.keys(this.categoriesMap);
  filteredSubcategories: string[] = [];

  constructor(
    private router: Router,
    private dashboardService: ClientDashboardService
  ) {}

  ngOnInit(): void {
    this.fetchBusinesses();
  }

  fetchBusinesses() {
    const userId = 2;

    this.dashboardService.getBusinessesByUser(userId)
      .subscribe({
        next: (res) => {

          this.setUserName(userId);

          this.businesses = res.map(b => ({
            id: b.id,
            businessName: b.name,
            category: b.categoryName?.toLowerCase(),
            subcategory: b.subcategoryName,
            status: b.status ?? 'Pending',
            description: b.description,
            contact: {
              phone: b.phoneNumber || '',
              email: b.email || '',
              city: b.city || ''
            }
          }));

          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error fetching businesses:', err);
          this.isLoading = false;
        }
      });
  }

  setUserName(userId: number) {
    this.fullName = userId === 1 ? 'Sai Chandrasekhar' : 'User';
  }

  trackById(index: number, item: Business) {
    return item.id;
  }

  addBusiness() {
    this.router.navigate(['/register-business']);
  }

  editBusiness(id: number) {
  const business = this.businesses.find(b => b.id === id);

  if (business) {
    this.editingBusiness = JSON.parse(JSON.stringify(business));

    // ✅ FIXED
    this.onCategoryChange(this.editingBusiness!.category);
  }
}

  // ✅ CATEGORY CHANGE
onCategoryChange(category: string) {
  this.filteredSubcategories = this.categoriesMap[category] || [];

  const sub = this.editingBusiness?.subcategory || '';

  if (!this.filteredSubcategories.includes(sub)) {
    if (this.editingBusiness) {
      this.editingBusiness.subcategory = '';
    }
  }
}
  saveEdits() {
    console.log('Updated Business:', this.editingBusiness);

    const index = this.businesses.findIndex(b => b.id === this.editingBusiness?.id);
    if (index !== -1 && this.editingBusiness) {
      this.businesses[index] = this.editingBusiness;
    }

    this.editingBusiness = null;
  }

  cancelEdit() {
    this.editingBusiness = null;
  }

  viewBusiness(id: number) {
    this.selectedBusiness = this.businesses.find(b => b.id === id) || null;
  }

  closeView() {
    this.selectedBusiness = null;
  }
}