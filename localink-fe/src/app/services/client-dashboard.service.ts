import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface BusinessDto {
  id: number;
  name: string;
  categoryName: string;
  subcategoryName: string;
  status: string;
  description?: string;
  phoneNumber?: string;
  email?: string;
  city?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ClientDashboardService {

  private baseUrl = 'http://localhost:5138/api/v1';

  constructor(private http: HttpClient) {}

  getBusinessesByUser(userId: number): Observable<BusinessDto[]> {
    return this.http.get<BusinessDto[]>(`${this.baseUrl}/user/${userId}`);
  }
}