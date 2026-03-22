import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgSelectModule } from '@ng-select/ng-select';
import { Router } from '@angular/router';
import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgSelectModule],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {

  signupForm: FormGroup;
  showPassword = false;
  showConfirmPassword = false;
  showSuccessPopup = false;

  // ✅ Default USER selected
  selectedType: 'user' | 'client' = 'user';


  countries = [
    { name: 'India', states: ['Tamil Nadu','Karnataka','Kerala','Maharashtra'] },
    { name: 'United States', states: ['California','Texas','Florida','New York'] },
    { name: 'Canada', states: ['Ontario','Quebec','British Columbia','Alberta'] },
    { name: 'Australia', states: ['New South Wales','Victoria','Queensland','Western Australia'] },
    { name: 'United Kingdom', states: ['England','Scotland','Wales','Northern Ireland'] },
    { name: 'Germany', states: ['Bavaria','Berlin','Hamburg','Hesse'] },
    { name: 'France', states: ['Île-de-France','Normandy','Brittany','Occitanie'] },
    { name: 'Japan', states: ['Tokyo','Osaka','Hokkaido','Kyoto'] },
    { name: 'Singapore', states: ['Central','North East','North West','South East'] },
    { name: 'UAE', states: ['Dubai','Abu Dhabi','Sharjah','Ajman'] }
  ];
  currentStep = 1;

stepFields: any = {
  1: ['name', 'phone', 'email'],
  2: ['country', 'state', 'city', 'pincode', 'street'],
  3: ['password', 'confirmPassword']
};

nextStep() {
  const fields = this.stepFields[this.currentStep];

  let isValid = true;

  fields.forEach((field: string) => {
    const control = this.signupForm.get(field);

    if (control) {
      control.markAsTouched();
      control.updateValueAndValidity();

      if (control.invalid) {
        isValid = false;
      }
    }
  });

  // password match check (step 3 only)
  if (this.currentStep === 3 && this.signupForm.errors?.['passwordMismatch']) {
    isValid = false;
  }

  if (!isValid) return; // ❌ BLOCK

  this.currentStep++;
}

prevStep() {
  if (this.currentStep > 1) {
    this.currentStep--;
  }
}

  states: string[] = [];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
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

      street: ['', [
        Validators.required,
        Validators.pattern('^\\S(.*\\S)?$')
      ]],

      city: ['', [
        Validators.required,
        Validators.pattern('^\\S(.*\\S)?$')
      ]],

      state: ['', [
        Validators.required,
        Validators.pattern('^\\S(.*\\S)?$')
      ]],

      country: ['', [
        Validators.required,
        Validators.pattern('^\\S(.*\\S)?$')
      ]],

      pincode: ['', [
        Validators.required,
        Validators.pattern('^[1-9][0-9]{5}$')
      ]],

      password: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*]).{8,}$'),
        Validators.pattern('^\\S(.*\\S)?$')
      ]],

      confirmPassword: ['', Validators.required]

    }, { validators: this.passwordMatchValidator });
  }

  // ✅ Set default userType on load
  ngOnInit() {
    this.signupForm.patchValue({
      userType: 'user'
    });
  }

  // ✅ Toggle handler
  isTypeLocked = false;

selectType(type: 'user' | 'client') {
  if (this.isTypeLocked) return;

  this.selectedType = type;

  this.signupForm.patchValue({
    userType: type
  });

  if (type === 'client') {
    this.isTypeLocked = true; // 🔒 lock toggle
  }
}

  passwordMatchValidator(form: AbstractControl): ValidationErrors | null {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;

    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  onCountryChange(countryName: string) {
    const selectedCountry = this.countries.find(c => c.name === countryName);
    this.states = selectedCountry ? selectedCountry.states : [];

    this.signupForm.patchValue({ state: '' });
  }

  onSubmit() {
    if (this.signupForm.valid) {
      const formData = this.signupForm.value;

      this.authService.register(formData).subscribe({
        next: () => {
          this.showSuccessPopup = true;

          setTimeout(() => {
  this.showSuccessPopup = false;
  this.router.navigate(['/login']);
}, 1500);
        },
        error: (err) => {
          console.error(err);
          alert(err.error?.message || 'Signup failed');
        }
      });
    }
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
    this.showSuccessPopup = false;
  }

  toggleConfirmPassword() {
    this.showConfirmPassword = !this.showConfirmPassword;
    this.showSuccessPopup = false;
  }

  closePopup() {
    this.showSuccessPopup = false;
  }

  trimField(fieldName: string) {
    const control = this.signupForm.get(fieldName);
    if (control && typeof control.value === 'string') {
      control.setValue(control.value.trim());
    }
  }

  get f() {
    return this.signupForm.controls;
  }

  // 🎨 KEEP YOUR CANVAS ANIMATION (UNCHANGED)
  ngAfterViewInit() {
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