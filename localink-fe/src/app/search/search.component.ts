import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CategoryService, Category } from '../services/category.service';
import { PopularBusinessesComponent } from '../popular-businesses/popular-businesses.component';

@Component({
selector: 'app-search',
standalone: true,
imports: [CommonModule, PopularBusinessesComponent],
templateUrl: './search.component.html',
styleUrl: './search.component.css'
})
export class SearchComponent {

categories: Category[] = [];

constructor(private categoryService: CategoryService) {}

ngOnInit() {
this.categories = this.categoryService.getCategories();
}

}