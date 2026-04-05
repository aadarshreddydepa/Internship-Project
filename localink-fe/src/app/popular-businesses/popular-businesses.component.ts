import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { PopularService, PopularBusiness } from '../services/popular.service';
import { FavoritesService } from '../services/favorites.service';
import { ToastService } from '../services/toast.service';

@Component({
  selector: 'app-popular-businesses',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './popular-businesses.component.html',
  styleUrl: './popular-businesses.component.css'
})
export class PopularBusinessesComponent implements OnInit {

  businesses: PopularBusiness[] = [];
  favoriteIds: number[] = [];
  userId: number = 0;

  constructor(
    private popularService: PopularService,
    private favoritesService: FavoritesService,
    private toastService: ToastService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.extractUserIdFromToken();
  }

  private extractUserIdFromToken(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      // Check multiple possible claim names
      const userIdValue = 
        payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] ||
        payload.nameid ||
        payload.userId ||
        payload.UserId ||
        payload.sub ||
        '0';
      this.userId = parseInt(userIdValue, 10);
      if (this.userId <= 0) {
        console.error('Invalid userId extracted from token:', userIdValue);
        this.userId = 0;
      }
    } catch (error) {
      console.error('Failed to extract userId from token:', error);
      this.userId = 0;
    }
  }

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.popularService.getTopBusinesses().subscribe({
      next: (data) => {
        this.businesses = data;
        this.loadFavorites();
      },
      error: (err) => {
        console.error('Error fetching popular businesses', err);
      }
    });
  }

  loadFavorites(): void {
    this.favoritesService.getFavorites(this.userId).subscribe({
      next: (data) => {
        this.favoriteIds = data;
        this.mapFavorites();
      },
      error: (err) => console.error('Error loading favorites', err)
    });
  }

  mapFavorites(): void {
    this.businesses.forEach(b => {
      b.isFavorite = this.favoriteIds.includes(b.id);
    });
  }

  toggleFavorite(business: PopularBusiness): void {
    if (business.isFavorite) {
      this.removeFavorite(business);
    } else {
      this.addFavorite(business);
    }
  }

  addFavorite(business: PopularBusiness): void {
    this.favoritesService.addFavorite(this.userId, business.id)
      .subscribe({
        next: () => {
          business.isFavorite = true;
          this.toastService.success('Added to favorites');
        },
        error: (err) => {
          console.error('Error adding favorite', err);
          this.toastService.error('Failed to add to favorites');
        }
      });
  }

  removeFavorite(business: PopularBusiness): void {
    this.favoritesService.removeFavorite(this.userId, business.id)
      .subscribe({
        next: () => {
          business.isFavorite = false;
          this.toastService.success('Removed from favorites');
        },
        error: (err) => {
          console.error('Error removing favorite', err);
          this.toastService.error('Failed to remove from favorites');
        }
      });
  }

  goToBusinessDetail(business: PopularBusiness): void {
    this.router.navigate(['/business', business.id], {
      queryParams: {
        categoryName: business.categoryName,
        subcategoryName: business.subcategoryName,
        categoryId: business.categoryId,
        subcategoryId: business.subcategoryId
      }
    });
  }

  getStars(rating: number): string {
    const full  = Math.floor(rating);
    const half  = rating % 1 >= 0.5 ? 1 : 0;
    const empty = 5 - full - half;
    return '★'.repeat(full) + (half ? '' : '') + '☆'.repeat(empty);
  }
}