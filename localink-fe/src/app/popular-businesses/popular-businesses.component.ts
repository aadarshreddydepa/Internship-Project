import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
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
  constructor(private popularService: PopularService) {}
  ngOnInit(): void {
    this.businesses = this.popularService.getPopularBusinesses();
  }
  /**
   * Returns a 5-character star string based on the rating.
   * Full stars (★) for each whole point, half for .5, empty (☆) for the rest.
   */
  getStars(rating: number): string {
    const full  = Math.floor(rating);
    const half  = rating % 1 >= 0.5 ? 1 : 0;
    const empty = 5 - full - half;
    return '★'.repeat(full) + (half ? '' : '') + '☆'.repeat(empty);
  }
}