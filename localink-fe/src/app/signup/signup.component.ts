import { Component, OnInit, AfterViewInit, NgZone, Inject, PLATFORM_ID } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { NgSelectModule } from '@ng-select/ng-select';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../core/services/auth.service';
import { HttpClient } from '@angular/common/http';
import { BusinessLocationService } from '../services/business-location.service';
import { BusinessPincodeService } from '../services/business-pincode.service';

import { environment } from '../../environments/environment';

declare var grecaptcha: any; 
@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgSelectModule, RouterModule],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit, AfterViewInit {

  signupForm: FormGroup;
  captchaToken: string = '';
  showPassword = false;
  showConfirmPassword = false;
  showSuccessPopup = false;
  isPincodeFocused = false;
  captchaError = false;
  captchaRendered = false;

  // // JSON DATA
  // locationData: any[] = [];
  countries: any[] = [];
  phoneCountries: any[] = [];
  states: any[] = [];
  cities: any[] = [];

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
    private locationService: BusinessLocationService,
    private ngZone: NgZone,
    private pincodeService: BusinessPincodeService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.signupForm = this.fb.group({
      userType: ['', Validators.required],

      name: ['', [
        Validators.required,
        Validators.pattern(/^[A-Za-z][A-Za-z\s]*$/)
      ]],

      email: [
        '',
        [
          Validators.required,
          Validators.pattern(/^[a-zA-Z][a-zA-Z0-9._%+-]*@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
        ]
      ],

      phoneCode: ['91', Validators.required],
      phone: [
        '',
        [
          Validators.required,
          Validators.pattern(/^[3-9][0-9]{9}$/)
        ]
      ],

      street: ['', [Validators.required, Validators.pattern(/^(?!\d+$)[A-Za-z0-9\s\-\:\/\,\.]+$/)]],
      city: ['', Validators.required],
      state: ['', Validators.required],
      country: ['', Validators.required],

      pincode: [
        '',
        [
          Validators.required,
          Validators.pattern(/^[A-Za-z0-9\-\s]{3,10}$/)
        ]
      ],

      password: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*]).{8,}$')
      ]],

      confirmPassword: ['', Validators.required]

    }, { validators: [this.passwordMatchValidator, this.countryPhoneValidator.bind(this)] });

    /* Dynamic phone validation */
    this.signupForm.get('phoneCode')?.valueChanges.subscribe(code => {
      const phoneControl = this.signupForm.get('phone');
      if (code === '91') {
        phoneControl?.setValidators([
          Validators.required,
          Validators.pattern(/^[3-9][0-9]{9}$/)
        ]);
      } else {
        phoneControl?.setValidators([
          Validators.required,
          Validators.pattern(/^(?!0+$)[0-9]{6,15}$/)
        ]);
      }
      phoneControl?.updateValueAndValidity();
    });
  }

  // LOAD JSON
  ngOnInit() {
    this.signupForm.patchValue({ userType: 'user' });

    // disable initially
    this.signupForm.get('pincode')?.disable();

    if (isPlatformBrowser(this.platformId)) {
      this.locationService.getCountries()
      .subscribe((data: any[]) => {
        this.countries = data;
        this.phoneCountries = data.map((c: any) => ({
          name: c.name,
          code: c.phonecode || c.phone_code || '',
          flag: '',
          searchLabel: `${c.name} +${c.phonecode || c.phone_code}`
        }));
      });
    }
  }
  allowOnlyLetters(event: KeyboardEvent) {
    const char = event.key;

    if (!/^[a-zA-Z\s]$/.test(char)) {
      event.preventDefault();
    }
  }


  onCountryChange() {
    const selectedCountry = this.signupForm.get('country')?.value;

    this.states = [];
    this.cities = [];

    this.signupForm.patchValue({
      state: '',
      city: '',
      pincode: ''
    });

    if (!selectedCountry) return;

    // AUTO-UPDATE PHONE CODE
    if (selectedCountry.phonecode || selectedCountry.phone_code) {
      this.signupForm.get('phoneCode')?.setValue(selectedCountry.phonecode || selectedCountry.phone_code);
    }

    this.locationService.getStates(selectedCountry.iso2)
      .subscribe(res => {
        this.states = res;
      });
  }

  onStateChange() {
    const selectedCountry = this.signupForm.get('country')?.value;
    const selectedState = this.signupForm.get('state')?.value;

    this.cities = [];
    this.signupForm.patchValue({ city: '', pincode: '' });

    if (!selectedCountry || !selectedState) return;

    this.locationService.getCities(selectedCountry.iso2, selectedState.iso2)
      .subscribe(res => {
        this.cities = res;
      });
  }

  onCityChange() {
    this.signupForm.get('pincode')?.enable();
    this.signupForm.patchValue({ pincode: '' });
  }

  /* ===========================
     PINCODE VALIDATION
  =========================== */
  validatePincode() {
    const control = this.signupForm.get('pincode');
    const pincode = control?.value;

    if (!pincode || pincode.length < 5) return;

    //  CLEAR OLD ERRORS FIRST
    control?.setErrors(null);

    this.pincodeService.validate(pincode)
      .subscribe({
        next: (res: any) => {
          if (!res || !res.country) {
            control?.setErrors({ invalidPincode: true });
            return;
          }

          const apiCountry = res.country;
          const apiState = res.state;
          const apiCity = res.city;

          const selectedCountry = this.signupForm.get('country')?.value;
          const selectedState = this.signupForm.get('state')?.value;
          const selectedCity = this.signupForm.get('city')?.value;

          const normalize = (val: string) =>
            val?.toLowerCase().replace(/\s/g, '');

          //  COUNTRY CHECK
          if (selectedCountry &&
              normalize(apiCountry) !== normalize(selectedCountry.name)) {
            control?.setErrors({ ...control.errors, invalidCountry: true });
            return;
          }

          //  STATE CHECK
          if (selectedState &&
              normalize(apiState) !== normalize(selectedState.name)) {
            control?.setErrors({ ...control.errors, invalidState: true });
            return;
          }

          //  CITY CHECK
          if (selectedCity && apiCity &&
              normalize(apiCity) !== normalize(selectedCity.name)) {
            control?.setErrors({ ...control.errors, invalidCity: true });
            return;
          }

          //  SUCCESS → CLEAR EVERYTHING
          control?.setErrors(null);
        },
        error: (err) => {
          console.error("API ERROR:", err);
          control?.setErrors({ invalidPincode: true });
        }
      });
  }

  countryPhoneValidator(group: AbstractControl): ValidationErrors | null {
    const country = group.get('country')?.value;
    const phoneCode = group.get('phoneCode')?.value;
    const phoneControl = group.get('phone');

    if (country && country.phonecode !== phoneCode) {
      phoneControl?.setErrors({
        ...(phoneControl.errors || {}),
        countryMismatch: true
      });
    } else {
      if (phoneControl?.errors) {
        const { countryMismatch, ...others } = phoneControl.errors;
        phoneControl.setErrors(Object.keys(others).length ? others : null);
      }
    }
    return null;
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
    if (!this.captchaToken) {
      this.captchaError = true;
      return;
    }
    if (this.signupForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;
      const { confirmPassword, ...payload } = this.signupForm.value;
      const formData = {
        ...payload,
        userType: this.selectedType,
        captchaToken: this.captchaToken
      };

      this.authService.register(formData).subscribe({
        next: () => {
          this.showSuccessPopup = true;
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        },
        error: (err: any) => {
          alert(err.error?.message || 'Signup failed');
          this.isSubmitting = false;
          // Reset captcha
          if (typeof grecaptcha !== 'undefined') {
            grecaptcha.reset();
            this.captchaToken = '';
          }
        }
      });
    }
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
  onPhoneInput(event: any) {
    let value = event.target.value.replace(/[^0-9]/g, '');
    if (/^0+$/.test(value)) value = '';
    this.signupForm.get('phone')?.setValue(value);
  }

  allowOnlyNumbers(event: KeyboardEvent) {
    const char = event.key;
    if (!/^[0-9]$/.test(char)) {
      event.preventDefault();
    }
  }
customSearch = (term: string, item: any) => {
  term = term.toLowerCase();

  return item.name.toLowerCase().includes(term) ||
         item.phonecode.includes(term.replace('+', ''));
};
  renderCaptcha() {
    if (!isPlatformBrowser(this.platformId)) return;

    const interval = setInterval(() => {
      if (!this.captchaRendered && typeof grecaptcha !== 'undefined') {
        this.captchaRendered = true;

        grecaptcha.render('recaptcha-container', {
          sitekey: environment.recaptchaSiteKey,
          theme: 'dark',
          callback: (token: string) => {
            this.ngZone.run(() => {
              this.captchaToken = token;
              this.captchaError = false;
              console.log('CAPTCHA TOKEN:', token);
            });
          }
        });

        clearInterval(interval);
      }
    }, 500);
  }

  // CANVAS ANIMATION (UNCHANGED)
  ngAfterViewInit() {
    if (!isPlatformBrowser(this.platformId)) return;
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
    this.renderCaptcha();
  }
}