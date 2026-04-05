import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService, AdminBusiness } from '../../services/admin.service';
import { UserProfile, UserService } from '../../services/user.service';
import { ToastService } from '../../services/toast.service';
import { ProfileComponent } from '../../pages/profile/profile.component';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageSwitcherComponent } from '../../components/language-switcher/language-switcher.component';

type Section = 'pending' | 'approved' | 'rejected' | 'inactive';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, ProfileComponent, TranslateModule, LanguageSwitcherComponent],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {

  businesses: AdminBusiness[] = [];
  currentSection: Section = 'pending';
  searchTerm = '';
  showProfile = false;
  selectedBusiness: AdminBusiness | null = null;
  username = localStorage.getItem('username') || 'Admin';

  rejectModalOpen = false;
  rejectComment = '';
  rejectBusinessId: number | null = null;

  // Loading states for each business action
  loadingActionId: number | null = null;
  loadingActionType: 'approve' | 'reject' | 'deactivate' | 'activate' | null = null;

  constructor(private service: AdminService,
              private userService: UserService,
              private toastService: ToastService,
              @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.loadBusinesses();
    this.loadUser();
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
    this.loadingActionId = id;
    this.loadingActionType = 'approve';
    this.service.updateStatus(id, { status: 'Approved' }).subscribe(() => {
      this.toastService.success('Business Approved Successfully');
      this.loadingActionId = null;
      this.loadingActionType = null;
      this.refresh();
    },
    (error) => {
      this.loadingActionId = null;
      this.loadingActionType = null;
      this.toastService.error('Failed to approve business');
    });
  }

  openRejectModal(id: number): void {
    this.rejectBusinessId = id;
    this.rejectModalOpen = true;
  }

  submitRejection(): void {
    if (!this.rejectComment.trim() || this.rejectBusinessId === null) return;

    this.loadingActionId = this.rejectBusinessId;
    this.loadingActionType = 'reject';
    this.service.updateStatus(this.rejectBusinessId, {
      status: 'Rejected',
      rejectionReason: this.rejectComment
    }).subscribe(() => {
      this.toastService.success('Business Rejected Successfully');
      this.loadingActionId = null;
      this.loadingActionType = null;
      this.closeRejectModal();
      this.refresh();
    },
    (error) => {
      this.loadingActionId = null;
      this.loadingActionType = null;
      this.toastService.error('Failed to reject business');
    });
  }

  closeRejectModal(): void {
    this.rejectModalOpen = false;
    this.rejectComment = '';
    this.rejectBusinessId = null;
  }

  deactivate(id: number): void {
    this.loadingActionId = id;
    this.loadingActionType = 'deactivate';
    this.service.updateStatus(id, { status: 'Inactive' }).subscribe(() => {
      this.toastService.success('Business Deactivated Successfully');
      this.loadingActionId = null;
      this.loadingActionType = null;
      this.refresh();
    },
    (error) => {
      this.loadingActionId = null;
      this.loadingActionType = null;
      this.toastService.error('Failed to deactivate business');
    });
  }

  activate(id: number): void {
    this.loadingActionId = id;
    this.loadingActionType = 'activate';
    this.service.updateStatus(id, { status: 'Approved' }).subscribe(() => {
      this.toastService.success('Business Activated Successfully');
      this.loadingActionId = null;
      this.loadingActionType = null;
      this.refresh();
    },
    (error) => {
      this.loadingActionId = null;
      this.loadingActionType = null;
      this.toastService.error('Failed to activate business');
    });
  }

  openDetails(b: AdminBusiness): void {
    this.selectedBusiness = b;
  }

  closeModal(): void {
    this.selectedBusiness = null;
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
  toggleProfile(): void {
    this.showProfile = true;
  }

  closeProfile(): void {
    this.showProfile = false;
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  loadUser() {
      this.userService.getUserProfile().subscribe({
        next: (data: UserProfile) => {
          this.username = data.fullName;
        },
        error: (err) => {
          console.error('Error fetching user', err);
        }
      });
    }
}