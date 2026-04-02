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
        map((data) =>
          data.slice(0, 8).map((b: any) => ({

            id: b.businessId,
            name: b.businessName,
            category: `${b.categoryName  || 'General'} -> ${b.subcategoryName || ''}`,
            description: b.description || 'No description available',
            image: b.primaryImage
              ? 'http://localhost:5138' + b.primaryImage
              : null,
            rating: 4
          }))
        )
      );
  }
}