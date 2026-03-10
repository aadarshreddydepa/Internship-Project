import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BusinessService, Business, BusinessStatus } from '../../services/business.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css'
})
export class AdminDashboardComponent {

  businesses: Business[] = [];

  searchTerm = '';
  selectedStatus = 'all';

  selectedBusiness: Business | null = null;

  toastMessage = '';
  toastType = '';
  showToast = false;

  constructor(private service: BusinessService) {}

  ngOnInit() {
    this.businesses = this.service.getAllBusinesses();
  }

  /* ==============================
     STATUS UPDATE METHODS
  ============================== */

  updateStatus(id: number, status: BusinessStatus, message: string, type: string) {
    this.service.updateStatus(id, status);
    this.notify(message, type);
  }

  approve(id: number) {
    this.updateStatus(id, 'approved', 'Business approved', 'success');
  }

  reject(id: number) {
    this.updateStatus(id, 'rejected', 'Business rejected', 'error');
  }

  deactivate(id: number) {
    this.updateStatus(id, 'inactive', 'Business deactivated', 'warning');
  }

  /* ==============================
     STATS COUNTERS
  ============================== */

  get totalCount() {
    return this.businesses.length;
  }

  get pendingCount() {
    return this.businesses.filter(b => b.status === 'pending').length;
  }

  get approvedCount() {
    return this.businesses.filter(b => b.status === 'approved').length;
  }

  get inactiveCount() {
    return this.businesses.filter(b => b.status === 'inactive').length;
  }

  /* ==============================
     FILTERING
  ============================== */

  get filteredBusinesses() {

    return this.businesses.filter(b => {

      const search =
        b.name.toLowerCase().includes(this.searchTerm.toLowerCase());

      const status =
        this.selectedStatus === 'all' || b.status === this.selectedStatus;

      return search && status;

    });

  }

  /* ==============================
     MODAL
  ============================== */

  openBusinessDetails(b: Business) {
    this.selectedBusiness = b;
  }

  closeModal() {
    this.selectedBusiness = null;
  }

  /* ==============================
     TOAST
  ============================== */

  notify(message: string, type: string) {

    this.toastMessage = message;
    this.toastType = type;
    this.showToast = true;

    setTimeout(() => {
      this.showToast = false;
    }, 2500);

  }

}