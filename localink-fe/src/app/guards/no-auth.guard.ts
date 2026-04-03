import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class NoAuthGuard implements CanActivate {

  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  canActivate(): boolean {

    // SSR bypass — allow on server
    if (!isPlatformBrowser(this.platformId)) {
      return true;
    }

    const token = localStorage.getItem('token');
    const role = localStorage.getItem('userType');

    // ── If already logged in → redirect to their dashboard ──
    if (token) {
      switch (role) {
        case 'client':
          this.router.navigate(['/client-dashboard']);
          break;
        case 'admin':
          this.router.navigate(['/admin-dashboard']);
          break;
        case 'user':
          this.router.navigate(['/user-dashboard']);
          break;
        default:
          // Unknown role — let them through to login (token might be stale)
          return true;
      }
      return false;
    }

    // No token → allow access to login/signup/forgot-password
    return true;
  }
}
