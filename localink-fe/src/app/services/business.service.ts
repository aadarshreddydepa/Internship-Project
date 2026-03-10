import { Injectable } from '@angular/core';

export type BusinessStatus = 'pending' | 'approved' | 'rejected' | 'inactive';

export interface Business {
  id: number;
  name: string;
  description: string;
  category: string;
  contact: string;
  rating: number;
  status: BusinessStatus;
}

@Injectable({
  providedIn: 'root'
})
export class BusinessService {

  private businesses: Business[] = [
    {
      id: 1,
      name: 'City Medical Clinic',
      description: '24/7 healthcare clinic',
      category: 'Medical',
      contact: '9999999999',
      rating: 4.5,
      status: 'pending'
    },
    {
      id: 2,
      name: 'Fresh Grocery Mart',
      description: 'Daily grocery store',
      category: 'General Store',
      contact: '8888888888',
      rating: 4.2,
      status: 'approved'
    },
    {
      id: 3,
      name: 'Math Genius Academy',
      description: 'Math tutoring center',
      category: 'Tutoring',
      contact: '7777777777',
      rating: 4.8,
      status: 'pending'
    }
  ];

  getAllBusinesses(): Business[] {
    return this.businesses;
  }

  updateStatus(id: number, status: BusinessStatus): void {
    const business = this.businesses.find(b => b.id === id);
    if (business) business.status = status;
  }

}