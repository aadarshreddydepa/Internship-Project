import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { PopularService, PopularBusiness } from '../services/popular.service';

@Component({
  selector: 'app-popular-businesses',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './popular-businesses.component.html',
  styleUrl: './popular-businesses.component.css'
})
export class PopularBusinessesComponent implements OnInit {

  businesses: PopularBusiness[] = [];

  constructor(
    private popularService: PopularService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    
    this.popularService.getTopBusinesses().subscribe({
      next: (data) => {
        this.businesses = data;
      },
      error: (err) => {
        console.error('Error fetching popular businesses', err);
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