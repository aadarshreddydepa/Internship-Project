import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

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
export class ClientDashboardComponent {

  businesses: Business[] = [
  {
    id: 1,
    businessName: 'My Restaurant',
    category: 'Food',
    subcategory: 'Restaurant',
    status: 'Approved',
    description: 'Best food in town',
    contact: {
      phone: '+91 9876543210',
      email: 'test@gmail.com',
      city: 'Chennai'
    }
  },
  {
    id: 2,
    businessName: 'Style Hub Salon',
    category: 'Services',
    subcategory: 'Salon',
    status: 'Pending',
    description: 'Professional grooming and beauty services',
    contact: {
      phone: '+91 9123456780',
      email: 'stylehub@gmail.com',
      city: 'Bangalore'
    }
  }
];

  selectedBusiness: Business | null = null;

  constructor(private router: Router) {}

  addBusiness() {
    this.router.navigate(['/register-business']);
  }

  editBusiness(id: number) {
    this.router.navigate(['/edit-business', id]);
  }

  // ✅ FIXED VIEW
  viewBusiness(id: number) {
    this.selectedBusiness = this.businesses.find(b => b.id === id) || null;
  }

  closeView() {
    this.selectedBusiness = null;
  }
}