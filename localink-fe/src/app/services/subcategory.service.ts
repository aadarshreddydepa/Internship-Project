import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Subcategory {
  id: number;
  name: string;
  iconUrl?: string;
  count?: number;
}

@Injectable({
  providedIn: 'root'
})
export class SubcategoryService {

  private apiUrl = 'http://localhost:5138/api/subcategory';

  constructor(private http: HttpClient) {}

  getSubcategories(categoryId: number): Observable<Subcategory[]> {
    return this.http.get<Subcategory[]>(`${this.apiUrl}/${categoryId}`);
  }
}