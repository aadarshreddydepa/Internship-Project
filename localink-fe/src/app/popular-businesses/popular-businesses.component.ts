import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PopularService, PopularBusiness } from '../services/popular.service';

@Component({
  selector: 'app-popular-businesses',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './popular-businesses.component.html',
  styleUrl: './popular-businesses.component.css'
})
export class PopularBusinessesComponent implements OnInit {

  businesses: PopularBusiness[] = [];

  constructor(private popularService: PopularService) {}

  ngOnInit(): void {
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