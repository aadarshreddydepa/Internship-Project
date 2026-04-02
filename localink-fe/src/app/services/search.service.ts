import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface BusinessDto {
  id: number;
  name: string;
  description: string;
  categoryName: string;
  subcategoryName: string;

  phoneNumber?: string;
  email?: string;

  city?: string;
  state?: string;
  status?: string;

  primaryImage?: string;
  subcategoryId: number;
}

@Injectable({
  providedIn: 'root'
})
export class SearchService {

  private baseUrl = 'http://localhost:5145/api/v1/business'; 

  constructor(private http: HttpClient) {}

  searchBusinesses(query: string): Observable<BusinessDto[]> {
    return this.http.get<BusinessDto[]>(
      `${this.baseUrl}/search?query=${query}`
    );
  }

  getBusinessById(id: number): Observable<BusinessDto> {
    return this.http.get<BusinessDto>(
      `${this.baseUrl}/v1/businesses/${id}`
    );
  }

  getBusinessesBySubcategory(subcategoryId: number): Observable<BusinessDto[]> {
    return this.http.get<BusinessDto[]>(
      `${this.baseUrl}/subcategories/${subcategoryId}/businesses`
    );
  }
}