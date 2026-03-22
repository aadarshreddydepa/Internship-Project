import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class BusinessListService {

  private baseUrl = 'http://localhost:5138/api/v1';

  constructor(private http: HttpClient) {}

  //  GET /api/v1/subcategories/{subcategoryId}/businesses
  getBusinessesBySubcategory(subcategoryId: number) {
    return this.http.get<any[]>(
      `${this.baseUrl}/subcategories/${subcategoryId}/businesses`
    );
  }

  //  GET /api/v1/businesses/{id}
  getBusinessById(id: number) {
    return this.http.get<any>(
      `${this.baseUrl}/businesses/${id}`
    );
  }
}