import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

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
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.fetchBusinesses();
  }

  fetchBusinesses() {
    const userId = 2;

    this.http.get<any[]>(`http://localhost:5173/api/business/user/${userId}`)
      .subscribe({
        next: (res) => {
          console.log("API RESPONSE:", res);

          
          this.setUserName(userId);

          this.businesses = res.map(b => ({
            id: b.businessId,
            businessName: b.businessName,
            category: b.category,
            subcategory: b.subcategory,
            status: b.status,
            description: b.description,
            contact: {
              phone: b.phone,
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

  // SAFE TEMP SOLUTION (NO API NEEDED)
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