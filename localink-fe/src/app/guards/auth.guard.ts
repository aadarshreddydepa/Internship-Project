import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  canActivate(route: any): boolean {

  if (!isPlatformBrowser(this.platformId)) {
    return true;
  }

  const token = localStorage.getItem('token');
  const role = localStorage.getItem('userType');

  if (!token) {
    this.router.navigate(['/']);
    return false;
  }

  const path = route.routeConfig?.path;

  if (path?.includes('admin') && role !== 'admin') {
    this.router.navigate(['/']);
    return false;
  }

  if (path?.includes('client') && role !== 'client') {
    this.router.navigate(['/']);
    return false;
  }

  if (path?.includes('user') && role !== 'user') {
    this.router.navigate(['/']);
    return false;
  }

  return true;
}
}