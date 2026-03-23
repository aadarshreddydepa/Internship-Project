import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { AuthService } from '../core/services/auth.service';
import { TokenService } from '../core/services/token.service';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;

  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let tokenServiceSpy: jasmine.SpyObj<TokenService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['login']);
    tokenServiceSpy = jasmine.createSpyObj('TokenService', ['setToken']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: TokenService, useValue: tokenServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // ---------------- BASIC ----------------
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // ---------------- FORM ----------------
  it('should have invalid form initially', () => {
    expect(component.loginForm.invalid).toBeTrue();
  });

  it('should validate email field', () => {
    const control = component.loginForm.get('usernameOrEmail');

    control?.setValue('invalid');
    expect(control?.valid).toBeFalse();

    control?.setValue('test@mail.com');
    expect(control?.valid).toBeTrue();
  });

  it('should validate password strength', () => {
    const control = component.loginForm.get('password');

    control?.setValue('weak');
    expect(control?.valid).toBeFalse();

    control?.setValue('Strong@123');
    expect(control?.valid).toBeTrue();
  });

  // ---------------- UI ----------------
  it('should toggle password visibility', () => {
    expect(component.showPassword).toBeFalse();

    component.togglePassword();
    expect(component.showPassword).toBeTrue();
  });

  // ---------------- LOGIN SUCCESS ----------------
  it('should login successfully and navigate to user dashboard', () => {
    const mockResponse = {
      token: '123',
      userType: 'user'
    };

    authServiceSpy.login.and.returnValue(of(mockResponse));

    component.loginForm.setValue({
      usernameOrEmail: 'test@mail.com',
      password: 'Strong@123'
    });

    component.login();

    expect(authServiceSpy.login).toHaveBeenCalled();
    expect(tokenServiceSpy.setToken).toHaveBeenCalledWith('123');
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/user-dashboard']);
  });

  it('should navigate to client dashboard for client user', () => {
    const mockResponse = {
      token: '123',
      userType: 'client'
    };

    authServiceSpy.login.and.returnValue(of(mockResponse));

    component.loginForm.setValue({
      usernameOrEmail: 'test@mail.com',
      password: 'Strong@123'
    });

    component.login();

    expect(routerSpy.navigate).toHaveBeenCalledWith(['/client-dashboard']);
  });

  // ---------------- LOGIN FAILURE ----------------
  it('should handle 401 error', () => {
    authServiceSpy.login.and.returnValue(
      throwError(() => ({ status: 401 }))
    );

    component.loginForm.setValue({
      usernameOrEmail: 'test@mail.com',
      password: 'Wrong@123'
    });

    component.login();

    expect(component.errorMessage).toBe('Invalid email or password');
  });

  it('should handle network error', () => {
    authServiceSpy.login.and.returnValue(
      throwError(() => ({ status: 0 }))
    );

    component.loginForm.setValue({
      usernameOrEmail: 'test@mail.com',
      password: 'Strong@123'
    });

    component.login();

    expect(component.errorMessage).toBe('Network error. Try again');
  });

  it('should handle generic error', () => {
    authServiceSpy.login.and.returnValue(
      throwError(() => ({ status: 500 }))
    );

    component.loginForm.setValue({
      usernameOrEmail: 'test@mail.com',
      password: 'Strong@123'
    });

    component.login();

    expect(component.errorMessage).toBe('Login failed. Try again');
  });

  // ---------------- VIEW SWITCH ----------------
  it('should switch to forgot password view', () => {
    component.goToForgotPassword();
    expect(component.currentView).toBe('forgot');
  });

  it('should return to login view', () => {
    component.backToLogin();
    expect(component.currentView).toBe('login');
  });

  // ---------------- EDGE ----------------
  it('should not call API if form invalid', () => {
    component.loginForm.setValue({
      usernameOrEmail: '',
      password: ''
    });

    component.login();

    expect(authServiceSpy.login).not.toHaveBeenCalled();
  });
});