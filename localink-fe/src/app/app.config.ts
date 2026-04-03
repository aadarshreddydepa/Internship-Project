import { ApplicationConfig, importProvidersFrom, PLATFORM_ID, APP_INITIALIZER } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { AuthInterceptor } from './core/interceptors/auth.interceptor';
import { TranslateModule } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';
import { AccessibilitySettingsService } from './services/accessibility-settings.service';
import { GestureNavigationService } from './services/gesture-navigation.service';
import { isPlatformBrowser } from '@angular/common';

/**
 * Factory function to initialize accessibility services
 */
export function accessibilityInitializer(
  platformId: Object,
  settingsService: AccessibilitySettingsService,
  gestureService: GestureNavigationService
): () => void {
  return () => {
    if (!isPlatformBrowser(platformId)) {
      return;
    }

    // Initialize gesture navigation if enabled
    const settings = settingsService.getSettings();
    if (settings.gestureNavigation) {
      gestureService.enable();
    }

    // Listen for settings changes to enable/disable gesture navigation
    settingsService.settings$.subscribe(newSettings => {
      if (newSettings.gestureNavigation) {
        gestureService.enable();
      } else {
        gestureService.disable();
      }
    });
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideAnimationsAsync(),
    provideHttpClient(
      withFetch(),
      withInterceptors([AuthInterceptor])
    ),
    importProvidersFrom(
      TranslateModule.forRoot({
        defaultLanguage: 'en'
      })
    ),
    provideTranslateHttpLoader({
      prefix: './assets/i18n/',
      suffix: '.json'
    }),
    // Initialize accessibility services on app startup
    {
      provide: APP_INITIALIZER,
      useFactory: accessibilityInitializer,
      deps: [PLATFORM_ID, AccessibilitySettingsService, GestureNavigationService],
      multi: true
    }
  ]
};

