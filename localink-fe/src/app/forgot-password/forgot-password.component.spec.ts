import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ForgotPasswordComponent } from './forgot-password.component';
import { AuthService } from '../core/services/auth.service';
import { of, throwError } from 'rxjs';

describe('ForgotPasswordComponent', () => {
  let component: ForgotPasswordComponent;
  let fixture: ComponentFixture<ForgotPasswordComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj('AuthService', [
      'verifyEmail',
      'resetPassword'
    ]);

    await TestBed.configureTestingModule({
      imports: [ForgotPasswordComponent],
      providers: [{ provide: AuthService, useValue: authServiceSpy }]
    }).compileComponents();

    fixture = TestBed.createComponent(ForgotPasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // ---------------- BASIC ----------------
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // ---------------- EMAIL VALIDATION ----------------
  it('should validate email form', () => {
    const control = component.emailForm.get('email');

    control?.setValue('invalid');
    expect(control?.valid).toBeFalse();

    control?.setValue('test@mail.com');
    expect(control?.valid).toBeTrue();
  });

  // ---------------- PASSWORD VALIDATION ----------------
  it('should validate password strength', () => {
    const control = component.resetForm.get('password');

    control?.setValue('weak');
    expect(control?.valid).toBeFalse();

    control?.setValue('Strong@123');
    expect(control?.valid).toBeTrue();
  });

  it('should detect password mismatch', () => {
    component.resetForm.setValue({
      password: 'Strong@123',
      confirmPassword: 'Wrong@123'
    });

    expect(component.resetForm.errors?.['mismatch']).toBeTruthy();
  });

  // ---------------- STEP FLOW ----------------
  it('should move to step 2 on successful email verification', () => {
    authServiceSpy.verifyEmail.and.returnValue(of({}));

    component.emailForm.setValue({ email: 'test@mail.com' });

    component.verifyEmail();

    expect(component.step).toBe(2);
  });

  it('should handle email verification failure', () => {
    authServiceSpy.verifyEmail.and.returnValue(
      throwError(() => ({ error: { message: 'Email not found' } }))
    );

    component.emailForm.setValue({ email: 'test@mail.com' });

    component.verifyEmail();

    expect(component.message).toBe('Email not found');
  });

  // ---------------- RESET PASSWORD ----------------
  it('should reset password successfully', () => {
    authServiceSpy.resetPassword.and.returnValue(of({}));

    component.email = 'test@mail.com';
    component.step = 2;

    component.resetForm.setValue({
      password: 'Strong@123',
      confirmPassword: 'Strong@123'
    });

    component.resetPassword();

    expect(component.step).toBe(3);
    expect(component.message).toBe('Password updated successfully');
  });

  it('should handle reset password error', () => {
    authServiceSpy.resetPassword.and.returnValue(
      throwError(() => ({ error: { message: 'Error' } }))
    );

    component.email = 'test@mail.com';
    component.step = 2;

    component.resetForm.setValue({
      password: 'Strong@123',
      confirmPassword: 'Strong@123'
    });

    component.resetPassword();

    expect(component.message).toBe('Error');
  });

  // ---------------- TOGGLES ----------------
  it('should toggle password visibility', () => {
    component.togglePassword();
    expect(component.showPassword).toBeTrue();

    component.toggleConfirmPassword();
    expect(component.showConfirmPassword).toBeTrue();
  });

  // ---------------- BACK NAV ----------------
  it('should emit back event from step 1', () => {
    spyOn(component.backToLogin, 'emit');

    component.goBack();

    expect(component.backToLogin.emit).toHaveBeenCalled();
  });

  it('should go back to step 1 from step 2', () => {
    component.step = 2;

    component.goBack();

    expect(component.step).toBe(1);
  });

  // ---------------- EDGE ----------------
  it('should not call API if email form invalid', () => {
    component.emailForm.setValue({ email: '' });

    component.verifyEmail();

    expect(authServiceSpy.verifyEmail).not.toHaveBeenCalled();
  });

  it('should not call API if reset form invalid', () => {
    component.step = 2;

    component.resetForm.setValue({
      password: '',
      confirmPassword: ''
    });

    component.resetPassword();

    expect(authServiceSpy.resetPassword).not.toHaveBeenCalled();
  });
});