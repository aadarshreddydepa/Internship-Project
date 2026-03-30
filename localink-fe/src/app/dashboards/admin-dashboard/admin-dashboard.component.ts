import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService, AdminBusiness } from '../../services/admin.service';

type Section = 'pending' | 'approved' | 'rejected' | 'inactive';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css'
})
export class AdminDashboardComponent implements OnInit {

  businesses: AdminBusiness[] = [];
  currentSection: Section = 'pending';
  searchTerm = '';

  selectedBusiness: AdminBusiness | null = null;

  toastMessage = '';
  showToast = false;

  rejectModalOpen = false;
  rejectComment = '';
  rejectBusinessId: number | null = null;

  constructor(private service: AdminService) {}

  ngOnInit(): void {
    this.loadBusinesses();
  }

  loadBusinesses(): void {
    this.service.getBusinesses().subscribe({
      next: (data) => {
        this.businesses = data;
      },
      error: (err) => {
        console.error('Error loading businesses:', err);
      }
    });
  }

  refresh(): void {
    this.loadBusinesses();
  }

  get filteredBusinesses(): AdminBusiness[] {
    return this.businesses
      .filter(b => b.status.toLowerCase() === this.currentSection)
      .filter(b =>
        b.name.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
  }

  approve(id: number): void {
    this.service.updateStatus(id, { status: 'Approved' }).subscribe(() => {
      this.notify('Business Approved');
      this.refresh();
    });
  }

  openRejectModal(id: number): void {
    this.rejectBusinessId = id;
    this.rejectModalOpen = true;
  }

  submitRejection(): void {
    if (!this.rejectComment.trim() || this.rejectBusinessId === null) return;

    this.service.updateStatus(this.rejectBusinessId, {
      status: 'Rejected',
      rejectionReason: this.rejectComment
    }).subscribe(() => {
      this.notify('Business Rejected');
      this.closeRejectModal();
      this.refresh();
    });
  }

  closeRejectModal(): void {
    this.rejectModalOpen = false;
    this.rejectComment = '';
    this.rejectBusinessId = null;
  }

  deactivate(id: number): void {
    this.service.updateStatus(id, { status: 'Inactive' }).subscribe(() => {
      this.notify('Business Deactivated');
      this.refresh();
    });
  }
  activate(id: number): void {
    this.service.updateStatus(id, { status: 'Approved' }).subscribe(() => {
      this.notify('Business Activated');
      this.refresh();
    });
  }

  openDetails(b: AdminBusiness): void {
    this.selectedBusiness = b;
  }

  closeModal(): void {
    this.selectedBusiness = null;
  }
  notify(message: string): void {
    this.toastMessage = message;
    this.showToast = true;
    setTimeout(() => { this.showToast = false; }, 2500);
  }

  downloadExcel(): void {
    this.service.exportExcel(this.currentSection).subscribe(blob => {
      const link = document.createElement('a');
      const url = window.URL.createObjectURL(blob);

      link.href = url;
      link.download = `${this.currentSection}-businesses.xlsx`;
      link.click();

      window.URL.revokeObjectURL(url);
    });
  }
}