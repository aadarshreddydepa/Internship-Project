import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export interface PopularBusiness {
  id: number;
  name: string;
  category: string;
  description: string;
  image: string | null;
  rating: number;
  totalReviews: number;
  categoryId: number;
  subcategoryId: number;
  categoryName: string;
  subcategoryName: string;
}

@Injectable({
  providedIn: 'root'
})
export class PopularService {

  private baseUrl = 'http://localhost:5138/api/v1';

  constructor(private http: HttpClient) {}

  getTopBusinesses(): Observable<PopularBusiness[]> {
    return this.http.get<any[]>(`${this.baseUrl}/business`)
      .pipe(
        map((data) => {
          if (!data || data.length === 0) {
            return [];
          }
          
          return data
            .map((b: any) => ({
              id: b.businessId,
              name: b.businessName,
              category: `${b.categoryName || 'General'} → ${b.subcategoryName || ''}`,
              description: b.description || 'No description available',
              image: b.primaryImage
                ? 'http://localhost:5138' + b.primaryImage
                : null,
              rating: b.averageRating || 0,
              totalReviews: b.totalReviews || 0,
              categoryId: b.categoryId,
              subcategoryId: b.subcategoryId,
              categoryName: b.categoryName || 'General',
              subcategoryName: b.subcategoryName || ''
            }))
            .filter((b: PopularBusiness) => b.totalReviews > 0)
            .sort((a: PopularBusiness, b: PopularBusiness) => b.rating - a.rating)
            .slice(0, 10);
        })
      );
  }
}