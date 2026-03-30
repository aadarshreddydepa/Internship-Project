import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { ClientDashboardService, BusinessDto } from '../../services/client-dashboard.service';

interface Business {
  id: number;
  businessName: string;
  category: string;
  subcategory: string;
  status: string;

  description?: string;
  contact?: any;
}

@Component({
  selector: 'app-client-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './client-dashboard.component.html',
  styleUrls: ['./client-dashboard.component.css']
})
export class ClientDashboardComponent implements OnInit {

  businesses: Business[] = [];
  selectedBusiness: Business | null = null;
  isLoading = true;

  fullName: string = '';

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
            category: b.categoryName,
            subcategory: b.subcategoryName,
            status: b.status ?? 'Pending',
            description: b.description,
            contact: {
              phone: b.phoneNumber,
              email: b.email,
              city: b.city
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
    if (userId === 1) {
      this.fullName = 'Sai Chandrasekhar';
    } else if (userId === 2) {
      this.fullName = 'Test User 2';
    } else {
      this.fullName = 'User';
    }
  }

  trackById(index: number, item: Business) {
    return item.id;
  }

  addBusiness() {
    this.router.navigate(['/register-business']);
  }

  editBusiness(id: number) {
    this.router.navigate(['/edit-business', id]);
  }

  viewBusiness(id: number) {
    this.selectedBusiness = this.businesses.find(b => b.id === id) || null;
  }

  closeView() {
    this.selectedBusiness = null;
  }
}