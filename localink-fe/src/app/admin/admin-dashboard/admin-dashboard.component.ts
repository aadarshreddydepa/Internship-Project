import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BusinessService, Business } from '../../services/business.service';


@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css'
})
export class AdminDashboardComponent {

  allBusinesses: Business[] = [];
  filteredBusinesses: Business[] = [];

  searchTerm = '';
  selectedStatus = 'all';

  totalBusinesses = 0;
  pendingCount = 0;
  approvedCount = 0;
  inactiveCount = 0;

  toastMessage = '';
  toastType = '';
  showToast = false;

  constructor(private businessService: BusinessService) {}

  ngOnInit() {
    this.loadBusinesses();
  }

  loadBusinesses() {
    this.allBusinesses = this.businessService.getAllBusinesses();
    this.filteredBusinesses = [...this.allBusinesses];

    this.totalBusinesses = this.allBusinesses.length;
    this.pendingCount = this.allBusinesses.filter(b => b.status === 'pending').length;
    this.approvedCount = this.allBusinesses.filter(b => b.status === 'approved').length;
    this.inactiveCount = this.allBusinesses.filter(b => b.status === 'inactive').length;
  }

  filterBusinesses() {
    this.filteredBusinesses = this.allBusinesses.filter(b => {
      const matchesSearch = b.name.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesStatus =
        this.selectedStatus === 'all' || b.status === this.selectedStatus;

      return matchesSearch && matchesStatus;
    });
  }

  approve(id: number) {
this.businessService.approveBusiness(id);
this.loadBusinesses();
this.showNotification("Business approved successfully", "success");
}

  reject(id: number) {
this.businessService.rejectBusiness(id);
this.loadBusinesses();
this.showNotification("Business rejected", "error");
}

  deactivate(id: number) {
this.businessService.deactivateBusiness(id);
this.loadBusinesses();
this.showNotification("Business deactivated", "warning");
}

  selectedBusiness: Business | null = null;
  openBusinessDetails(business: Business) {
  this.selectedBusiness = business;
}

closeModal() {
  this.selectedBusiness = null;
}
showNotification(message: string, type: string) {

this.toastMessage = message;
this.toastType = type;
this.showToast = true;

setTimeout(() => {
this.showToast = false;
}, 3000);


}

}