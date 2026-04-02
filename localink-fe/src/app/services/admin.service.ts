import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AdminBusiness {
  id: number;
  name: string;
  category: string;
  subcategory: string;
  description: string;
  email: string;
  phone: string;
  address: string;
  ownerName: string;
  registeredDate: string;
  status: string;
  rejectionComment?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  private apiUrl = 'http://localhost:5138/api/v1/admin';

  constructor(private http: HttpClient) {}

  getBusinesses(): Observable<AdminBusiness[]> {
    return this.http.get<AdminBusiness[]>(`${this.apiUrl}/businesses`);
  }

  updateStatus(id: number, payload: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/business/${id}/status`, payload);
  }

  exportExcel(section: string): Observable<Blob> {
    return this.http.get(
      `${this.apiUrl}/export?status=${section}`,
      { responseType: 'blob' }
    );
  }
}