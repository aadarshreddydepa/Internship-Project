import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, switchMap, filter } from 'rxjs';

import { CategoryService, Category } from '../../services/category.service';
import { PopularBusinessesComponent } from '../../popular-businesses/popular-businesses.component';
import { ProfileComponent } from '../../pages/profile/profile.component';
import { UserProfile, UserService } from '../../services/user.service';
import { SearchService, BusinessDto } from '../../services/search.service';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, FormsModule, PopularBusinessesComponent, ProfileComponent],
  templateUrl: './user-dashboard.component.html',
  styleUrl: './user-dashboard.component.css'
})
export class UserDashboardComponent implements OnInit {

  categories: Category[] = [];
  username: string = '';
  searchTerm: string = '';

  searchResults: BusinessDto[] = [];
  private searchSubject = new Subject<string>();

  showProfile = false;

  constructor(
    private categoryService: CategoryService,
    private userService: UserService,
    private businessService: SearchService
  ) {}

  ngOnInit(): void {
    this.loadCategories();
    this.loadUser();

    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      filter((query: string) => query.trim().length > 3),
      switchMap(query => this.businessService.searchBusinesses(query))
    ).subscribe({
      next: (data) => {
        this.searchResults = data;
        console.log(data);
      },
      error: (err) => console.error(err)
    });
  }

  onSearchChange(value: string) {
    this.searchTerm = value;

    const trimmed = value?.trim();

    if (!trimmed) {
      this.searchResults = []; 
      return;
    }

    this.searchSubject.next(trimmed);
  }

 loadUser() {
    this.userService.getUserProfile().subscribe({
      next: (data: UserProfile) => {
        this.username = data.fullName;
      },
      error: (err) => {
        console.error('Error fetching user', err);
      }
    });
  }

  loadCategories(): void {
    this.categoryService.getCategories().subscribe({
      next: (data) => {
        this.categories = data;
      },
      error: (err) => {
        console.error('Error fetching categories', err);
      }
    });
  }

  get filteredCategories(): Category[] {
    return this.categories;
  }

  toggleProfile(): void {
    this.showProfile = true;
  }

  closeProfile(): void {
    this.showProfile = false;
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  openCategory(categoryId: number): void {
    window.location.href = `/subcategory/${categoryId}`;
  }
}