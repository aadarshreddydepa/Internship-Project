import { Component, OnInit, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgSelectModule } from '@ng-select/ng-select';
import { Router } from '@angular/router';
import { AuthService } from '../core/services/auth.service';
import { HttpClient } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { Inject, PLATFORM_ID } from '@angular/core';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgSelectModule],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit, AfterViewInit {

  signupForm: FormGroup;

  showPassword = false;
  showConfirmPassword = false;
  showSuccessPopup = false;
  errorMessage = '';
  // JSON DATA
  locationData: any[] = [];
  countries: string[] = [];
  states: string[] = [];

  selectedType: 'user' | 'client' = 'user';
  currentStep = 1;

  stepFields: any = {
    1: ['name', 'phone', 'email'],
    2: ['country', 'state', 'city', 'pincode', 'street'],
    3: ['password', 'confirmPassword']
  };

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.signupForm = this.fb.group({
      userType: ['', Validators.required],

      name: ['', [
        Validators.required,
        Validators.pattern('^\\S(.*\\S)?$')
      ]],

      email: ['', [
        Validators.required,
        Validators.pattern('^[a-zA-Z0-9]+([._%+-]?[a-zA-Z0-9]+)*@[a-zA-Z0-9-]+(\\.[a-zA-Z]{2,})+$'),
        Validators.pattern('^\\S+$')
      ]],

      phone: ['', [
        Validators.required,
        Validators.pattern('^[0-9]{10}$')
      ]],

      countryCode: ['+91', Validators.required],

      street: ['', Validators.required],
      city: ['', Validators.required],
      state: ['', Validators.required],
      country: ['', Validators.required],

      pincode: ['', [
        Validators.required,
        Validators.pattern('^[1-9][0-9]{5}$')
      ]],

      password: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*]).{8,}$')
      ]],

      confirmPassword: ['', Validators.required]

    }, { validators: this.passwordMatchValidator });
  }

  // LOAD JSON
  ngOnInit() {
    this.signupForm.patchValue({ userType: 'user' });

    this.http.get<any[]>('assets/countries.json').subscribe(data => {
  this.locationData = data;
  this.countries = data.map(c => c.name); // full objects for ng-select
});
  }

  // COUNTRY CHANGE
 onCountryChange(event: any) {

  //handle both string and object
  const countryName = typeof event === 'string' ? event : event?.name;

  const country = this.locationData.find(
    (c: any) => c.name === countryName
  );

  console.log('Selected country:', countryName);
  console.log('Matched object:', country);

  this.states = (country?.states || []).map((s: any) => s.name);

  this.signupForm.patchValue({
    state: ''
  });
}
  // STEP NAVIGATION
  nextStep() {
    const fields = this.stepFields[this.currentStep];
    let isValid = true;

    fields.forEach((field: string) => {
      const control = this.signupForm.get(field);
      if (control) {
        control.markAsTouched();
        if (control.invalid) isValid = false;
      }
    });

    if (this.currentStep === 3 && this.signupForm.errors?.['passwordMismatch']) {
      isValid = false;
    }

    if (!isValid) return;
    this.currentStep++;
  }

  prevStep() {
    if (this.currentStep > 1) this.currentStep--;
  }

  // TYPE SWITCH
  selectType(type: 'user' | 'client') {
  this.selectedType = type;
  this.signupForm.patchValue({ userType: type });
}

  // PASSWORD VALIDATION
  passwordMatchValidator(form: AbstractControl): ValidationErrors | null {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  // SUBMIT
  isSubmitting = false;
  onSubmit() {
      this.errorMessage = '';

      if (this.signupForm.invalid || this.isSubmitting) return;

      this.isSubmitting = true;

      const { confirmPassword, ...raw } = this.signupForm.value;

      const payload = {
        ...raw,
        email: raw.email.trim().toLowerCase(), 
        name: raw.name.trim(),
        userType: this.selectedType
      };

      this.authService.register(payload).subscribe({
        next: () => {
          this.showSuccessPopup = true;

          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        },
        error: (err: any) => {
          this.errorMessage = err?.error?.message || 'Signup failed';
          this.isSubmitting = false;
        }
      });
    }

  // PASSWORD TOGGLE
  togglePassword() {
    this.showPassword = !this.showPassword;
  }
  toggleConfirmPassword() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }
  get f() {
    return this.signupForm.controls;
  }
  closePopup() {
  this.showSuccessPopup = false;
}
allowOnlyNumbers(event: KeyboardEvent) {
  const charCode = event.key.charCodeAt(0);
  if (charCode < 48 || charCode > 57) {
    event.preventDefault();
  }
}
  // CANVAS ANIMATION (UNCHANGED)
  ngAfterViewInit() {
    if(!isPlatformBrowser(this.platformId)) return;
    const glow = document.querySelector('.cursor-glow') as HTMLElement;

    document.addEventListener('mousemove', (e) => {
      if (glow) {
        glow.style.left = e.clientX + 'px';
        glow.style.top = e.clientY + 'px';
      }
    });

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