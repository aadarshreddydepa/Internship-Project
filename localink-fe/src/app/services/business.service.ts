import { Injectable } from '@angular/core';

export interface Business {
  id: number;
  name: string;
  description: string;
  category: string;
  subcategory: string;
  contact: string;
  status: 'pending' | 'approved' | 'rejected' | 'inactive';
  rating: number;
}

@Injectable({
  providedIn: 'root'
})
export class BusinessService {

  businesses: Business[] = [

    {
      id: 1,
      name: 'City Medical Clinic',
      description: '24/7 healthcare clinic',
      category: 'Medical',
      subcategory: 'Clinic',
      contact: '9999999999',
      status: 'pending',
      rating: 4.5
    },

    {
      id: 2,
      name: 'Fresh Grocery Mart',
      description: 'Daily groceries store',
      category: 'General Store',
      subcategory: 'Groceries',
      contact: '8888888888',
      status: 'approved',
      rating: 4.2
    },

    {
      id: 3,
      name: 'Math Genius Academy',
      description: 'Math tutoring center',
      category: 'Tutoring',
      subcategory: 'Math',
      contact: '7777777777',
      status: 'pending',
      rating: 4.8
    }

  ];

  getAllBusinesses() {
    return this.businesses;
  }

  getPendingBusinesses() {
    return this.businesses.filter(b => b.status === 'pending');
  }

  approveBusiness(id: number) {
    const business = this.businesses.find(b => b.id === id);
    if (business) {
      business.status = 'approved';
    }
  }

  rejectBusiness(id: number) {
    const business = this.businesses.find(b => b.id === id);
    if (business) {
      business.status = 'rejected';
    }
  }

  deactivateBusiness(id: number) {
    const business = this.businesses.find(b => b.id === id);
    if (business) {
      business.status = 'inactive';
    }
  }

}