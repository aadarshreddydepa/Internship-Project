import { Component, OnInit, AfterViewInit, NgZone, Inject, PLATFORM_ID } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { NgSelectModule } from '@ng-select/ng-select';
import { Router } from '@angular/router';
import { AuthService } from '../core/services/auth.service';
import { HttpClient } from '@angular/common/http';
import { LocationService } from '../services/location.service';
import { PostalService } from '../services/postal.service';

declare var grecaptcha: any; 
@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgSelectModule],
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

  // // JSON DATA
  // locationData: any[] = [];
  countries: string[] = [];
  states: string[] = [];
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
    private locationService: LocationService,
    private ngZone: NgZone,
    private postalService: PostalService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.signupForm = this.fb.group({
      userType: ['', Validators.required],

      name: ['', [
        Validators.required,
        Validators.pattern('^[A-Za-z]+(\\s[A-Za-z]+)*$')
      ]],

      email: ['', [
        Validators.required,
        Validators.pattern(
    '^(?!.*\\.\\.)(?!.*\\.$)(?!^\\.)([A-Za-z0-9]+([._%+-][A-Za-z0-9]+)*)@[A-Za-z0-9-]+(\\.[A-Za-z]{2,})+$'
  ),
        Validators.pattern('^\\S+$')
      ]],

      phone: ['', [
        Validators.required,
        Validators.pattern('^[1-9][0-9]{9}$')
      ]],

      countryCode: [null, Validators.required],

      street: ['', [Validators.required, Validators.pattern(/^(?!\d+$)[A-Za-z0-9\s\-\:\/\,\.]+$/)]],
      city: ['', Validators.required],
      state: ['', Validators.required],
      country: ['', Validators.required],

      pincode: ['', [
        Validators.required,
        Validators.pattern('^[0-9A-Za-z\\-\\s]{3,10}$')
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

    // disable initially
    this.signupForm.get('pincode')?.disable();

    this.locationService.getCountries()
    .subscribe((data: any[]) => {
      this.countries = data;
    });

    // listen to ALL changes
    this.signupForm.valueChanges.subscribe(() => {
      this.onCityChange();
    });
  }
  allowOnlyLetters(event: KeyboardEvent) {
    const char = event.key;

    if (!/^[a-zA-Z\s]$/.test(char)) {
      event.preventDefault();
    }
  }

  validatePincode() {
    const control = this.signupForm.get('pincode');

    // skip if disabled
    if (control?.disabled) return;

    const pincode = this.signupForm.get('pincode')?.value;
    const country = this.signupForm.get('country')?.value;

    // prevent unnecessary API calls
    if (!pincode || pincode.length < 5 || !country) return;

    this.postalService.validate(pincode, country.name)
      .subscribe({
        next: (res: any) => {

          const data = res;

          if (!data.features || data.features.length === 0) {
            this.signupForm.get('pincode')?.setErrors({ invalidPostal: true });
            return;
          }

          const location = data.features[0].properties;

          const cityName = location.city || location.town || location.village;
          const stateName = location.state;

          // find matching objects
          const normalize = (val: string) => val?.toLowerCase().replace(/\s/g, '');
          const matchedState = this.states.find((s: any) =>
            normalize(s.name) === normalize(stateName)
          );
          const matchedCity = this.cities.find((c: any) =>
            normalize(c.name) === normalize(cityName)
          );


          // Optional autofill
          this.signupForm.patchValue({
            state: matchedState || null,
            city: matchedCity || null
          });

          this.signupForm.get('pincode')?.setErrors(null);
        },
        error: () => {
          // DO NOT block user
          console.warn('Postal validation failed');
        }
      });
  }

  onCountryChange(country: any) {
    this.signupForm.patchValue({
      countryCode: country.phonecode
    });

    this.locationService.getStates(country.iso2)
      .subscribe(data => {
        this.states = data;
        this.cities = [];
      });

    this.signupForm.patchValue({
      state: '',
      city: '',
      pincode: ''
    });
    this.signupForm.get('pincode')?.disable();
  }

  onStateChange(state: any) {
    const country = this.signupForm.get('country')?.value;

    this.locationService.getCities(country.iso2, state.iso2)
      .subscribe(data => {
        this.cities = data;
      });

    this.signupForm.patchValue({ city: '', pincode: '' });
    this.signupForm.get('pincode')?.disable();
  }
  onCityChange() {
    const country = this.signupForm.get('country')?.value;
    const state = this.signupForm.get('state')?.value;
    const city = this.signupForm.get('city')?.value;

    if (country && state && city) {
      this.signupForm.get('pincode')?.enable();
    } else {
      this.signupForm.get('pincode')?.disable();
    }
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
    alert("Please complete CAPTCHA");
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

        //smooth delay before redirect
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (err:any) => {
        alert(err.error?.message || 'Signup failed');
        this.isSubmitting = false;
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
allowOnlyNumbers(event: KeyboardEvent) {
  const charCode = event.key.charCodeAt(0);
  if (charCode < 48 || charCode > 57) {
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

    grecaptcha.ready(() => {
      grecaptcha.render('recaptcha-container', {
        sitekey: '6LeAuJwsAAAAAF0BaOuNYhhyq_1dWaCpY4G3-yFX',
        callback: (token: string) => {
          this.ngZone.run(() => {
            this.captchaToken = token;
            console.log('CAPTCHA TOKEN:', token);
          });
        }
      });
    });
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