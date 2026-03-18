import { Component } from '@angular/core';
import {
  FormBuilder,
  Validators,
  ReactiveFormsModule,
  FormGroup,
  AbstractControl
} from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

import { AuthService } from '../core/services/auth.service';
import { TokenService } from '../core/services/token.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  loginForm!: FormGroup;
  showPassword = false;
  submitted = false;
  isLoading = false;
  errorMessage = "";

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private tokenService: TokenService,
    private router: Router
  ) {
    this.initializeForm();
  }

  private initializeForm() {
    this.loginForm = this.fb.group({
      userType: ['', Validators.required],

      usernameOrEmail: [
        '',
        [
          Validators.required,
          Validators.email,
          Validators.maxLength(100)
        ]
      ],

      password: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          Validators.maxLength(50),
          Validators.pattern(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/
          )
        ]
      ]
    });
  }

  // 🔥 EASY ACCESS (clean template)
  get f(): { [key: string]: AbstractControl } {
    return this.loginForm.controls;
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  // 🔥 FIELD STATE HELPERS
  isInvalid(field: string): boolean {
    const control = this.f[field];
    return !!(control && control.invalid && (control.touched || this.submitted));
  }

  isValid(field: string): boolean {
    const control = this.f[field];
    return !!(control && control.valid && (control.touched || this.submitted));
  }

  // 🔥 ERROR MESSAGES (CENTRALIZED)
  getError(field: string): string {
    const control = this.f[field];

    if (!control || !control.errors) return '';

    if (control.errors['required']) return `${this.getFieldName(field)} is required`;
    if (control.errors['email']) return 'Enter a valid email address';
    if (control.errors['minlength']) return `${this.getFieldName(field)} is too short`;
    if (control.errors['maxlength']) return `${this.getFieldName(field)} is too long`;

    if (control.errors['pattern']) {
      if (field === 'password') {
        return 'Password must include uppercase, lowercase, number & special character';
      }
    }

    return 'Invalid field';
  }

  private getFieldName(field: string): string {
    const map: any = {
      userType: 'Account type',
      usernameOrEmail: 'Email',
      password: 'Password'
    };
    return map[field] || field;
  }

  // 🔥 SUBMIT
  login() {
    this.submitted = true;
    this.errorMessage = '';

    if (this.loginForm.invalid) {
      return;
    }

    this.isLoading = true;

    this.authService.login(this.loginForm.value).subscribe({
      next: (res) => {
        this.tokenService.setToken(res.token);
        this.router.navigate(['/dashboard']);
      },
      error: () => {
        this.errorMessage = 'Invalid credentials. Please try again.';
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }
}