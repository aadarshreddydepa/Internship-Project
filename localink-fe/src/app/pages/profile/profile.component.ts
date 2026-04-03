import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { UserService } from '../../services/user.service';
import { TokenService } from '../../core/services/token.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  user: any | null = null;
  editableUser: any = null;

  isLoading = false;
  isLoggedIn = false;
  isEditMode = false;

  errorMessage = '';

  constructor(
    private userService: UserService,
    private tokenService: TokenService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const token = this.tokenService.getToken();
    this.isLoggedIn = !!token;

    if (this.isLoggedIn) {
      this.loadUser();
    }
  }

  loadUser() {
    this.isLoading = true;
    this.errorMessage = '';

    this.userService.getUserProfile().subscribe({
      next: (data) => {
        this.user = data?.data || data;
        this.isLoading = false;
      },
      error: (err) => {
        if (err.status === 401) {
          this.errorMessage = 'Session expired. Please login again.';
          this.logout();
        } else {
          this.errorMessage = 'Failed to load profile';
        }
        this.isLoading = false;
      }
    });
  }

  enableEdit() {
    this.isEditMode = true;

    // Deep clone (prevents live mutation)
    this.editableUser = JSON.parse(JSON.stringify(this.user));
  }

  cancelEdit() {
    this.isEditMode = false;
    this.editableUser = null;
    this.errorMessage = '';
  }

  saveProfile() {
    this.errorMessage = '';

    this.userService.updateUserProfile(this.editableUser).subscribe({
      next: () => {
        this.user = { ...this.editableUser };
        this.isEditMode = false;
        this.editableUser = null;
      },
      error: (err) => {
        if (err.error?.errors) {
          this.errorMessage = Object.values(err.error.errors).flat().join(', ');
        } else {
          this.errorMessage = 'Failed to update profile';
        }
      }
    });
  }

  logout() {
    this.tokenService.logout();
    this.user = null;
    this.isLoggedIn = false;
    this.router.navigate(['/']);
  }

  goToLogin() {
    this.router.navigate(['/']);
  }
}