import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class BusinessListService {

  private apiUrl = 'http://localhost:5138/api/Business';

  constructor(private http: HttpClient) {}

  getBusinessesBySubcategory(subcategoryId: number) {
    return this.http.get<any[]>(`${this.apiUrl}?subcategoryId=${subcategoryId}`);
  }

  
  getBusinessById(id: number) {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }
}