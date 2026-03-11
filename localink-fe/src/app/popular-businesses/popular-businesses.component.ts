import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PopularService, PopularBusiness } from '../services/popular.service';

@Component({
  selector: 'app-popular-businesses',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './popular-businesses.component.html',
  styleUrl: './popular-businesses.component.css'
})
export class PopularBusinessesComponent {

  businesses: PopularBusiness[] = [];

  constructor(private popularService: PopularService) {}

  ngOnInit() {
    this.businesses = this.popularService.getPopularBusinesses();
  }

}