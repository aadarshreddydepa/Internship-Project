import { Component, AfterViewInit } from '@angular/core';
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
import { ForgotPasswordComponent } from '../forgot-password/forgot-password.component';

// Declare global grecaptcha so TypeScript doesn't complain
declare const grecaptcha: any;

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, ForgotPasswordComponent],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements AfterViewInit {

  loginForm!: FormGroup;
  showPassword = false;
  submitted = false;
  isLoading = false;
  errorMessage = "";
  captchaToken: string | null = null;

  // 🔥 VIEW STATE
  currentView: 'login' | 'forgot' = 'login';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private tokenService: TokenService,
    private router: Router
  ) {
    this.initializeForm();

    this.loginForm.valueChanges.subscribe(() => {
      this.errorMessage = '';
    });
  }

  private initializeForm() {
    this.loginForm = this.fb.group({
      usernameOrEmail: [
        '',
        [Validators.required, Validators.email, Validators.maxLength(100)]
      ],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          Validators.maxLength(50),
          Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/)
        ]
      ]
    });
  }

  get f(): { [key: string]: AbstractControl } {
    return this.loginForm.controls;
  }

togglePassword() {
  this.showPassword = !this.showPassword;
}

  isInvalid(field: string): boolean {
    const control = this.f[field];
    return !!(control && control.invalid && (control.touched || this.submitted));
  }

  getError(field: string): string {
    const control = this.f[field];
    if (!control || !control.errors) return '';

    if (control.errors['required']) return `${field === 'password' ? 'Password' : 'Email'} is required`;
    if (control.errors['email']) return 'Enter a valid email address';
    if (control.errors['minlength']) return 'Too short';
    if (control.errors['maxlength']) return 'Too long';
    if (control.errors['pattern']) return 'Password must be strong';

    return 'Invalid field';
  }

  login() {
  try {
    this.submitted = true;
    this.errorMessage = '';

    if (this.loginForm.invalid) {
      const firstInvalid = document.querySelector('.invalid') as HTMLElement;
      firstInvalid?.focus();
      return;
    }

    // Block submission if reCAPTCHA not completed
    if (!this.captchaToken) {
      this.errorMessage = 'Please complete the reCAPTCHA verification.';
      return;
    }

    this.isLoading = true;

    const payload = {
      usernameOrEmail: this.loginForm.value.usernameOrEmail.trim().toLowerCase(),
      password: this.loginForm.value.password,
      captchaToken: this.captchaToken
    };

    this.authService.login(payload).subscribe({
      next: (res:any) => {
        try {
          this.tokenService.setToken(res.token);

          const role = (res?.userType || '').toLowerCase();

          if (role === 'client') {
            this.router.navigate(['/client-dashboard']);
          } else {
            this.router.navigate(['/user-dashboard']);
          }
        } catch (err) {
          this.errorMessage = 'Something went wrong after login';
        }
      },
      error: (err:any) => {
        this.handleError(err);
      },
      complete: () => {
        this.isLoading = false;
      }
    });

  } catch (error) {
    this.errorMessage = "Unexpected error occurred";
    this.isLoading = false;
  }
}

handleError(err: any) {
  if (err.status === 401) {
    this.errorMessage = 'Invalid email or password';
  } else if (err.status === 0) {
    this.errorMessage = 'Network error. Try again';
  } else {
    this.errorMessage = 'Login failed. Try again';
  }

  this.isLoading = false;
  this.triggerErrorAnimation();
}

  triggerErrorAnimation() {
    const card = document.getElementById('loginCard');
    if (!card) return;

    card.classList.add('shake');
    setTimeout(() => card.classList.remove('shake'), 400);
  }

  // 🔥 VIEW SWITCH
  goToForgotPassword() {
    this.currentView = 'forgot';
  }

  backToLogin() {
    this.currentView = 'login';
    this.captchaToken = null;
    this.renderCaptcha();
  }

  renderCaptcha() {
    setTimeout(() => {
      const captchaEl = document.getElementById('login-captcha');
      if (captchaEl && typeof grecaptcha !== 'undefined') {
        try {
          grecaptcha.render(captchaEl, {
            sitekey: '6LeWsJ0sAAAAAKwBUTRqFvX9qufIJVUrrId14onY',
            theme: 'dark',
            callback: (token: string) => {
              this.captchaToken = token;
              this.errorMessage = '';
            },
            'expired-callback': () => {
              this.captchaToken = null;
            },
            'error-callback': () => {
              this.captchaToken = null;
            }
          });
        } catch (e) {
          console.warn('Login reCAPTCHA render failed or already rendered', e);
        }
      }
    }, 300);
  }

  ngAfterViewInit() {
    this.renderCaptcha();

  /* CURSOR GLOW */
  const glow = document.querySelector('.cursor-glow') as HTMLElement;

  document.addEventListener('mousemove', (e) => {
    if (glow) {
      glow.style.left = e.clientX + 'px';
      glow.style.top = e.clientY + 'px';
    }
  });

  /* CANVAS LINES */
  const canvas = document.querySelector('.lines-canvas') as HTMLCanvasElement;
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const resize = () => {
    canvas.width = window.innerWidth / 2;
    canvas.height = window.innerHeight;
  };

  resize();
  window.addEventListener('resize', resize);

  const points = Array.from({ length: 40 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    vx: (Math.random() - 0.5) * 0.4,
    vy: (Math.random() - 0.5) * 0.4
  }));

  const draw = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    points.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
      if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

      points.forEach(p2 => {
        const dist = Math.hypot(p.x - p2.x, p.y - p2.y);

        if (dist < 130) {
          ctx.strokeStyle = `rgba(200,169,126,${1 - dist / 130})`;
          ctx.lineWidth = 1;

          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
      });
    });

    requestAnimationFrame(draw);
  };

  draw();
}
}