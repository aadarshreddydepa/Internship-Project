import { Injectable } from '@angular/core';

export interface PopularBusiness {
  id: number;
  name: string;
  category: string;
  rating: number;
  image: string;
}

@Injectable({
  providedIn: 'root'
})
export class PopularService {

  private businesses: PopularBusiness[] = [
    { id: 1, name: 'Business Name 1', category: 'Medical',       rating: 4.0, image: '' },
    { id: 2, name: 'Business Name 2', category: 'Food & Dining', rating: 4.5, image: '' },
    { id: 3, name: 'Business Name 3', category: 'General Store', rating: 3.5, image: '' },
    { id: 4, name: 'Business Name 4', category: 'Tutoring',      rating: 5.0, image: '' }
  ];

  getPopularBusinesses(): PopularBusiness[] {
    return this.businesses;
  }

}