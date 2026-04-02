import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { TokenService } from '../core/services/token.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private router: Router,
    private tokenService: TokenService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  canActivate(route: any): boolean {

  if (!isPlatformBrowser(this.platformId)) {
    return true;
  }

  const token = this.tokenService.getToken();
  const role = localStorage.getItem('userType');

  if (!token || !this.tokenService.hasValidToken()) {
    this.tokenService.logout();
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