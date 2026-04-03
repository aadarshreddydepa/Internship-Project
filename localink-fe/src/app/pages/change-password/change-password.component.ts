import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.css']
})
export class ChangePasswordComponent {

  currentPassword = '';
  newPassword = '';
  confirmPassword = '';

  correctPassword = 'Human@123';

  successMessage = '';
  currentError: string = '';
newError: string = '';
confirmError: string = '';

  showCurrent = false;
  showNew = false;
  showConfirm = false;

  currentValid: boolean | null = null;
  newValid: boolean | null = null;
  confirmValid: boolean | null = null;

 

  /* ================= CURRENT PASSWORD ================= */

  validateCurrent() {
    if (!this.currentPassword) {
      this.currentError = '';
      this.currentValid = null;
      return;
    }

    this.currentValid = this.currentPassword === this.correctPassword;
    this.currentError = this.currentValid ? '' : 'Current password is incorrect';
  }

  /* ================= NEW PASSWORD ================= */

  validateNew() {

    if (!this.newPassword) {
      this.newError = '';
      this.newValid = null;
      return;
    }

    if (this.newPassword === this.currentPassword) {
      this.newValid = false;
      this.newError = "New password cannot be same as current password";
      return;
    }

    if (this.newPassword.length < 8) {
      this.newValid = false;
      this.newError = "Password must be at least 8 characters";
      return;
    }

    if (!/[A-Z]/.test(this.newPassword)) {
      this.newValid = false;
      this.newError = "Must contain one uppercase letter";
      return;
    }

    if (!/[a-z]/.test(this.newPassword)) {
      this.newValid = false;
      this.newError = "Must contain one lowercase letter";
      return;
    }

    if (!/[0-9]/.test(this.newPassword)) {
      this.newValid = false;
      this.newError = "Must contain one number";
      return;
    }

    if (!/[!@#$%^&*]/.test(this.newPassword)) {
      this.newValid = false;
      this.newError = "Must contain one special character";
      return;
    }

    this.newValid = true;
    this.newError = '';
  }

  /* ================= CONFIRM PASSWORD ================= */

  validateConfirm() {

    if (!this.confirmPassword) {
      this.confirmError = '';
      this.confirmValid = null;
      return;
    }

    this.confirmValid = this.newPassword === this.confirmPassword;
    this.confirmError = this.confirmValid ? '' : 'Passwords do not match';
  }

  /* ================= SUBMIT ================= */

  changePassword() {

    this.successMessage = '';

    this.validateCurrent();
    this.validateNew();
    this.validateConfirm();

    if (!this.currentValid || !this.newValid || !this.confirmValid) {
      return;
    }

    this.successMessage = 'Password changed successfully';

    setTimeout(() => {
      this.successMessage = '';
    }, 5000);
  }
}