import {
  Component,
  EventEmitter,
  Output,
  AfterViewInit,
  OnDestroy,
  ChangeDetectionStrategy,
  Inject,
  PLATFORM_ID
} from '@angular/core';
import {
  FormBuilder,
  Validators,
  FormGroup,
  ReactiveFormsModule
} from '@angular/forms';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { AuthService } from '../core/services/auth.service';
import { Subject, takeUntil } from 'rxjs';
import { environment } from '../../environments/environment';

declare var grecaptcha: any;

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush // ✅ PERFORMANCE BOOST
})
export class ForgotPasswordComponent implements AfterViewInit, OnDestroy {

  @Output() backToLogin = new EventEmitter<void>();

  step = 1;
  message = "";
  isLoading = false;
  email = "";
  countdown = 3;

  showPassword = false;
  showConfirmPassword = false;

  emailForm!: FormGroup;
  resetForm!: FormGroup;

  emailSubmitted = false;
  resetSubmitted = false;

  captchaToken: string = '';
  captchaError = false;
  captchaRendered = false;

  private destroy$ = new Subject<void>(); // ✅ memory leak fix
  private countdownInterval: any;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {

    this.emailForm = this.fb.group({
      email: ['', [
        Validators.required,
        Validators.email,
        Validators.maxLength(100)
      ]]
    });

    this.resetForm = this.fb.group({
      otp: ['', [
        Validators.required,
        Validators.pattern('^[0-9]{6}$') // ✅ STRICT OTP VALIDATION
      ]],
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(50),
        Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*]).{8,}$'),
        Validators.pattern('^\\S(.*\\S)?$')
      ]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });

    // ✅ Clear message on input change
    this.emailForm.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe(() => this.message = '');

    this.resetForm.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe(() => this.message = '');
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value?.trim();
    const confirmPassword = form.get('confirmPassword')?.value?.trim();

    if (!confirmPassword) return null;
    return password === confirmPassword ? null : { mismatch: true };
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  verifyEmail() {
    this.emailSubmitted = true;

    if (this.emailForm.invalid || this.isLoading) return;

    if (!this.captchaToken) {
      this.captchaError = true;
      return;
    }

    this.isLoading = true;
    this.message = "";

    this.email = this.emailForm.value.email.trim().toLowerCase();

    this.authService.sendOtp({
      email: this.email,
      captchaToken: this.captchaToken
    })
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: () => {
        this.step = 2;
        this.isLoading = false;

        this.resetSubmitted = false;
        this.resetForm.reset();
      },
      error: (err: any) => {
        this.message = err?.error?.message || "Something went wrong";
        this.isLoading = false;

        if (typeof grecaptcha !== 'undefined') {
          grecaptcha.reset();
          this.captchaToken = '';
        }
      }
    });
  }

  
  resetPassword() {
    this.resetSubmitted = true;

    if (this.resetForm.invalid || this.isLoading) return;

    this.isLoading = true;
    this.message = "";

    const payload = {
      email: this.email,
      otp: this.resetForm.value.otp.trim(),
      newPassword: this.resetForm.value.password.trim()
    };

    this.authService.resetPassword(payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.step = 3;
          this.startCountdown();
        },
        error: (err: any) => {
          this.message = err?.error?.message || "Invalid OTP";
          this.isLoading = false;
        }
      });
  }

  onCaptchaResolved(token: string) {
    this.captchaToken = token;
    this.captchaError = false;
  }

  startCountdown() {
    this.countdown = 3;

    this.countdownInterval = setInterval(() => {
      this.countdown--;

      if (this.countdown <= 0) {
        clearInterval(this.countdownInterval);
        this.backToLogin.emit();
      }
    }, 1000);
  }

  goBack() {
    if (this.step === 1) {
      this.backToLogin.emit();
    } else {
      this.step = 1;
      this.message = "";
    }
  }

  ngAfterViewInit() {
    if (!isPlatformBrowser(this.platformId)) return;

    const interval = setInterval(() => {
      if (!this.captchaRendered && typeof grecaptcha !== 'undefined') {
        this.captchaRendered = true;

        grecaptcha.render('forgotCaptcha', {
          sitekey: environment.recaptchaSiteKey,
          callback: (token: string) => {
            this.onCaptchaResolved(token);
          }
        });

        clearInterval(interval);
      }
    }, 500);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();

    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
  }
}