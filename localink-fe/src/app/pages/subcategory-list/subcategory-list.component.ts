import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SubcategoryService, Subcategory } from '../../services/subcategory.service';
import { CategoryService } from '../../services/category.service';

@Component({
  selector: 'app-subcategory-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './subcategory-list.component.html',
  styleUrls: ['./subcategory-list.component.css']
})
export class SubcategoryListComponent implements OnInit {

  categoryId!: number;
  subcategories: Subcategory[] = [];
  displayCategoryName = '';

  constructor(
    private route: ActivatedRoute,
    private subcategoryService: SubcategoryService,
    private categoryService: CategoryService 
  ) {}

  ngOnInit(): void {

    // Get categoryId from route
    this.categoryId = Number(this.route.snapshot.paramMap.get('id'));

    // Get category name
    this.categoryService.getCategories().subscribe({
      next: (categories) => {
        const selected = categories.find(c => c.id === this.categoryId);
        this.displayCategoryName = selected?.name || 'Category';
      },
      error: (err) => {
        console.error('Error fetching category name', err);
      }
    });

    // Get subcategories
    this.subcategoryService.getSubcategories(this.categoryId).subscribe({
      next: (data: Subcategory[]) => {
        this.subcategories = data.map((sub: Subcategory) => ({
          ...sub
        }));
      },
      error: (err) => {
        console.error('Error fetching subcategories', err);
      }
    });
  }
}