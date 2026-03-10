import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BusinessService, Business } from '../../services/business.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css'
})
export class AdminDashboardComponent implements OnInit {

  pendingBusinesses: Business[] = [];
  allBusinesses: Business[] = [];

  constructor(private businessService: BusinessService) {}

  ngOnInit() {
    this.loadBusinesses();
  }

  loadBusinesses() {
    this.pendingBusinesses = this.businessService.getPendingBusinesses();
    this.allBusinesses = this.businessService.getAllBusinesses();
  }

  approve(id: number) {
    this.businessService.approveBusiness(id);
    this.loadBusinesses();
  }

  reject(id: number) {
    this.businessService.rejectBusiness(id);
    this.loadBusinesses();
  }

  deactivate(id: number) {
    this.businessService.deactivateBusiness(id);
    this.loadBusinesses();
  }

}