import { HttpInterceptorFn } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';

/**
 * Language Interceptor - Adds x-lang header to all API requests
 * This enables backend response translation
 */
export const LanguageInterceptor: HttpInterceptorFn = (req, next) => {
  const platformId = inject(PLATFORM_ID);
  const translate = inject(TranslateService);

  // Only add language header in browser environment
  if (!isPlatformBrowser(platformId)) {
    return next(req);
  }

  // Get current language from TranslateService or localStorage
  let currentLang = translate.currentLang;
  
  // Fallback to localStorage if translate service hasn't initialized yet
  if (!currentLang) {
    currentLang = localStorage.getItem('localink_lang') || 'en';
  }

  // Clone the request and add the x-lang header
  const cloned = req.clone({
    setHeaders: {
      'x-lang': currentLang
    }
  });

  return next(cloned);
};

/**
 * Location Header Interceptor - Adds user location headers for geolocation features
 */
export const LocationInterceptor: HttpInterceptorFn = (req, next) => {
  const platformId = inject(PLATFORM_ID);

  if (!isPlatformBrowser(platformId)) {
    return next(req);
  }

  // Get stored location from localStorage
  const storedLocation = localStorage.getItem('localink_location');
  
  if (storedLocation) {
    try {
      const location = JSON.parse(storedLocation);
      
      if (location?.lat && location?.lng) {
        const cloned = req.clone({
          setHeaders: {
            'X-User-Latitude': location.lat.toString(),
            'X-User-Longitude': location.lng.toString()
          }
        });
        return next(cloned);
      }
    } catch {
      // Invalid stored location, ignore
    }
  }

  return next(req);
};
