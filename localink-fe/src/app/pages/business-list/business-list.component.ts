import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

import { BusinessListService } from '../../services/business-list.service';

@Component({
  selector: 'app-business-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './business-list.component.html',
  styleUrls: ['./business-list.component.css']
})
export class BusinessListComponent implements OnInit {

  category = '';
  subcategory = '';

  businesses: any[] = [];
  paginatedBusinesses: any[] = [];

  currentPage = 1;
  pageSize = 5;
  totalPages = 1;

  constructor(
    private route: ActivatedRoute,
    private service: BusinessListService
  ) {}

  ngOnInit() {

    this.category = this.route.snapshot.paramMap.get('category')!;
    this.subcategory = this.route.snapshot.paramMap.get('subcategory')!;

    this.service.getBusinesses().subscribe(data => {

      this.businesses =
        data[this.category]?.[this.subcategory] || [];

      this.totalPages = Math.ceil(this.businesses.length / this.pageSize);

      this.updatePage();

    });

  }

  updatePage() {

    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;

    this.paginatedBusinesses = this.businesses.slice(start, end);

  }

  changePage(page:number){

    if(page < 1 || page > this.totalPages) return;

    this.currentPage = page;

    this.updatePage();

  }

}