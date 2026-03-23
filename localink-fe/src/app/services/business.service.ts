// import { Injectable } from '@angular/core';
// import businessesData from '../../assets/data/businesses.json';

// export type BusinessStatus =
//   | 'pending'
//   | 'approved'
//   | 'rejected'
//   | 'inactive';

// export interface Business {
//   id: number;
//   name: string;
//   description: string;
//   category: string;
//   contact: string;
//   rating: number;
//   status: BusinessStatus;
//   rejectionComment?: string;
// }

// @Injectable({
//   providedIn: 'root'
// })
// export class BusinessService {

//   private businesses: Business[] = businessesData as Business[];

//   getBusinesses(): Business[] {
//     return this.businesses;
//   }

//   updateStatus(id: number, status: BusinessStatus): void {
//     const business = this.businesses.find(b => b.id === id);
//     if (business) {
//       business.status = status;
//     }
//   }

//   rejectBusiness(id: number, comment: string): void {
//     const business = this.businesses.find(b => b.id === id);
//     if (business) {
//       business.status = 'rejected';
//       business.rejectionComment = comment;
//     }
//   }

// }

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BusinessService {

  private apiUrl = 'http://localhost:5104/business';

  constructor(private http: HttpClient) {}

  registerBusiness(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, data);
  }
}