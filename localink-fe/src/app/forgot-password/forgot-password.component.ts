import { Component, EventEmitter, Output, AfterViewInit } from '@angular/core';
import { FormBuilder, Validators, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../core/services/auth.service';

// Declare global grecaptcha so TypeScript doesn't complain
declare const grecaptcha: any;

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent implements AfterViewInit {

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
  submitted = false;
  captchaToken: string | null = null;

  constructor(private fb: FormBuilder, private authService: AuthService) {

    this.emailForm = this.fb.group({
      email: ['', [
        Validators.required,
        Validators.email,
        Validators.maxLength(100)
      ]]
    });

    this.resetForm = this.fb.group({
  password: ['', [
    Validators.required,
    Validators.minLength(8),
    Validators.maxLength(50),
    Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*]).{8,}$'),
    Validators.pattern('^\\S(.*\\S)?$')
  ]],
  confirmPassword: ['', Validators.required]
}, { validators: this.passwordMatchValidator });

    this.emailForm.valueChanges.subscribe(() => this.message = '');
    this.resetForm.valueChanges.subscribe(() => this.message = '');
  }

  passwordMatchValidator(form: FormGroup) {
  const password = form.get('password')?.value;
  const confirmPassword = form.get('confirmPassword')?.value;

  if (!confirmPassword) return null;

  return password === confirmPassword ? null : { mismatch: true };
}

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  // STEP 1
  async verifyEmail() {
    try {
      this.submitted = true;

      if (this.emailForm.invalid || this.isLoading) return;

      // Block if reCAPTCHA not completed
      if (!this.captchaToken) {
        this.message = 'Please complete the reCAPTCHA verification.';
        return;
      }

      this.isLoading = true;
      this.message = "";

      this.email = this.emailForm.value.email.trim().toLowerCase();

      this.authService.verifyEmail(this.email).subscribe({
        next: () => {
          this.step = 2;
          this.isLoading = false;
        },
        error: (err:any) => {
          this.message = err?.error?.message || "Email not found";
          this.isLoading = false;
        }
      });

    } catch (error) {
      this.message = "Unexpected error occurred";
      this.isLoading = false;
    }
  }

  // STEP 2
  async resetPassword() {
    try {
      this.submitted = true;

      if (this.resetForm.invalid || this.isLoading) return;

      this.isLoading = true;
      this.message = "";

      const payload = {
        email: this.email,
        newPassword: this.resetForm.value.password.trim(),
        captchaToken: this.captchaToken
      };
      
      console.log('Sending reset payload:', payload);

      this.authService.resetPassword(payload).subscribe({
        next: () => {
          this.step = 3;
          this.message = "Password updated successfully";

          this.startCountdown();
        },
        error: (err:any) => {
          this.message = err?.error?.message || "Something went wrong";
          this.isLoading = false;
        }
      });

    } catch (error) {
      this.message = "Unexpected error occurred";
      this.isLoading = false;
    }
  }

  startCountdown() {
    const interval = setInterval(() => {
      this.countdown--;

      if (this.countdown === 0) {
        clearInterval(interval);
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
      this.captchaToken = null;
      this.renderCaptcha();
    }
  }

  renderCaptcha() {
    setTimeout(() => {
      const captchaEl = document.getElementById('forgot-captcha');
      if (captchaEl && typeof grecaptcha !== 'undefined') {
        try {
          grecaptcha.render(captchaEl, {
            sitekey: '6LeWsJ0sAAAAAKwBUTRqFvX9qufIJVUrrId14onY',
            theme: 'dark',
            callback: (token: string) => {
              this.captchaToken = token;
              this.message = '';
            },
            'expired-callback': () => {
              this.captchaToken = null;
            },
            'error-callback': () => {
              this.captchaToken = null;
            }
          });
        } catch (e) {
          // If already rendered, this might throw, which we can safely ignore
          console.warn('Captcha render failed or already rendered', e);
        }
      }
    }, 100);
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