import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

import { CategoryService, Category } from '../../services/category.service';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.css']
})
export class CategoriesComponent {

  categories: Category[] = [];

  constructor(
    private categoryService: CategoryService,
    private router: Router
  ) {
    this.categories = this.categoryService.getCategories();
  }

  openCategory(category: Category) {
  this.router.navigate(['/subcategory', category.id]);
}

}