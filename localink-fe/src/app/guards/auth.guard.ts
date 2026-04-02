import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {

    // SSR — no auth context on server, don't pre-render protected routes
    if (!isPlatformBrowser(this.platformId)) {
      return false;
    }

    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userType');

    // ── No token → redirect to login ──
    if (!token) {
      this.router.navigate(['/']);
      return false;
    }

    // ── Role-based check via route data ──
    const allowedRoles: string[] | undefined = route.data?.['roles'];

    if (allowedRoles && allowedRoles.length > 0) {
      if (!userRole || !allowedRoles.includes(userRole)) {
        // User doesn't have the required role → redirect to login
        this.router.navigate(['/']);
        return false;
      }
    }

    return true;
  }
}