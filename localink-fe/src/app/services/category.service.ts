import { Injectable } from '@angular/core';

export interface Category {
  id: string;
  name: string;
  icon: string;
}

@Injectable({
  providedIn: 'root'
})
export class CategoryService {

  private categories: Category[] = [

    { id: 'medical', name: 'Medical', icon: '🩺' },
    { id: 'food', name: 'Food & Dining', icon: '🍴' },
    { id: 'general', name: 'General Store', icon: '🛒' },
    { id: 'tutoring', name: 'Tutoring', icon: '🎓' },
    { id: 'repair', name: 'Repair Services', icon: '🔧' },
    { id: 'home', name: 'Home & Garden', icon: '🏠' }

  ];

  getCategories() {
    return this.categories;
  }

}