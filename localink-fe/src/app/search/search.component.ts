import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CategoryService, Category } from '../services/category.service';
import { PopularBusinessesComponent } from '../popular-businesses/popular-businesses.component';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, FormsModule, PopularBusinessesComponent],
  templateUrl: './search.component.html',
  styleUrl: './search.component.css'
})
export class SearchComponent implements OnInit {

  categories: Category[] = [];
  username: string = 'Sankeerth';
  searchTerm: string = '';

  constructor(
    private categoryService: CategoryService,
    private router: Router
  ) {}
  ngOnInit(): void {
    this.categories = this.categoryService.getCategories();
  }
  get filteredCategories(): Category[] {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) return this.categories;
    return this.categories.filter(c =>
      c.name.toLowerCase().includes(term)
    );
  }
  goToProfile(): void {
    this.router.navigate(['/profile']);
  }
  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}