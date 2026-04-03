import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

import { CategoryService, Category } from '../../services/category.service';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.css']
})
export class CategoriesComponent {

  categories: Category[] = [];

  constructor(
    private categoryService: CategoryService,
    private router: Router
  ) {
    this.loadCategories(); 
  }

  loadCategories() {
    this.categoryService.getCategories().subscribe({
      next: (data: any[]) => {
        this.categories = data.map((cat: any) => ({
          ...cat,
          iconUrl: this.fixIconPath(cat.iconUrl)
        }));
      },
      error: (err: any) => {
        console.error('Error fetching categories', err);
      }
    });
  }

  fixIconPath(path: string): string {
    if (!path) return '';

    if (path.startsWith('/assets')) return path;

    if (path.startsWith('/images')) {
      return '/assets' + path;
    }

    // fallback safety
    return '/assets/images/icons/default.svg';
  }

  openCategory(category: Category) {
    this.router.navigate(['/subcategory', category.id]);
  }
}