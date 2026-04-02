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

  //  Updated base URL (matches backend)
  private apiUrl = 'http://localhost:5145/api/v1/categories';

  constructor(private http: HttpClient) {}

  // Proper typing added
  getSubcategories(categoryId: number): Observable<Subcategory[]> {
    return this.http.get<Subcategory[]>(
      `${this.apiUrl}/${categoryId}/subcategories`
    );
  }
}