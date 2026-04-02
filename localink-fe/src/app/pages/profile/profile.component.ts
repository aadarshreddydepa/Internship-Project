import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { UserService } from '../../services/user.service';
import { TokenService } from '../../core/services/token.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  user: any | null = null;
  isLoading = false;
  errorMessage = '';
  isLoggedIn = false;

  constructor(
    private userService: UserService,
    private tokenService: TokenService,
    private router: Router
  ) {}

  ngOnInit(): void {

    const token = this.tokenService.getToken();

    this.isLoggedIn = !!token;

    if (!this.isLoggedIn) {
      return;
    }

    this.loadUser();
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