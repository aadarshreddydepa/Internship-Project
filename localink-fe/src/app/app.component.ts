import { Component, Inject, PLATFORM_ID, OnInit, Renderer2 } from '@angular/core';
import { Router, RouterLink, RouterOutlet, NavigationEnd } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { isPlatformBrowser, DOCUMENT } from '@angular/common';
import { filter } from 'rxjs/operators';

import { LanguageSwitcherComponent } from './components/language-switcher/language-switcher.component';
import { CommonModule } from '@angular/common';
import { ScreenReaderService } from './services/screen-reader.service';
import { GlobalAccessibilitySoundService } from './services/global-accessibility-sound.service';
import { UniversalAccessibilitySoundDirective } from './directives/universal-accessibility-sound.directive';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, LanguageSwitcherComponent, CommonModule, UniversalAccessibilitySoundDirective],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  // All supported languages
  private readonly supportedLangs = [
    'en', 'zh', 'ja', 'de', 'fr', 'es', 'pt', 'ru', 'ko', 'it',
    'ar', 'hi', 'ta', 'sd', 'ur', 'te', 'bn', 'mr', 'gu', 'kn',
    'ml', 'pa', 'as', 'or', 'ne', 'sa', 'sat', 'kok', 'ks', 'mni',
    'mai', 'brx', 'doi'
  ];

  // RTL languages
  private readonly rtlLangs = ['ar', 'sd', 'ur'];

  constructor(
    private translate: TranslateService,
    @Inject(PLATFORM_ID) private platformId: Object,
    @Inject(DOCUMENT) private document: Document,
    private renderer: Renderer2,
    private router: Router,
    private screenReader: ScreenReaderService,
    private globalSound: GlobalAccessibilitySoundService
  ) {
    this.translate.addLangs(this.supportedLangs);
    this.translate.setDefaultLang('en');
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.initializeLanguage();
      this.setupScreenReaderAnnouncements();
      this.setupKeyboardNavigation();
    }
  }

  private setupScreenReaderAnnouncements(): void {
    // Subscribe to router events for page change announcements
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      const pageName = this.getPageNameFromUrl(event.url);
      this.screenReader.announcePageChange(pageName);
    });
  }

  private setupKeyboardNavigation(): void {
    // Add skip link functionality
    this.renderer.listen('document', 'keydown', (e: KeyboardEvent) => {
      // Handle Tab key to show skip link
      if (e.key === 'Tab') {
        const skipLink = this.document.querySelector('.skip-link');
        if (skipLink && document.activeElement === this.document.body) {
          (skipLink as HTMLElement).focus();
        }
      }
    });
  }

  private getPageNameFromUrl(url: string): string {
    const routes: { [key: string]: string } = {
      '/': 'Home',
      '/login': 'Login',
      '/signup': 'Sign Up',
      '/dashboard': 'Dashboard',
      '/profile': 'Profile',
      '/business': 'Business',
      '/search': 'Search Results'
    };
    
    for (const [route, name] of Object.entries(routes)) {
      if (url.startsWith(route)) {
        return name;
      }
    }
    return 'Page';
  }

  skipToMainContent(): void {
    const mainContent = this.document.querySelector('main') || this.document.querySelector('[role="main"]');
    if (mainContent) {
      (mainContent as HTMLElement).focus();
      (mainContent as HTMLElement).setAttribute('tabindex', '-1');
    }
  }

  private initializeLanguage(): void {
    // Priority: 1. localStorage, 2. Browser language, 3. Default (en)
    const savedLang = localStorage.getItem('localink_lang');
    const browserLang = this.translate.getBrowserLang();
    
    let targetLang = 'en';
    
    if (savedLang && this.supportedLangs.includes(savedLang)) {
      targetLang = savedLang;
    } else if (browserLang && this.supportedLangs.includes(browserLang)) {
      targetLang = browserLang;
      // Optionally show language detection suggestion
      this.maybeShowLanguageSuggestion(browserLang);
    }
    
    this.setLanguage(targetLang);
  }

  private setLanguage(lang: string): void {
    this.translate.use(lang);
    localStorage.setItem('localink_lang', lang);
    this.updateDirection(lang);
  }

  private updateDirection(lang: string): void {
    const dir = this.rtlLangs.includes(lang) ? 'rtl' : 'ltr';
    this.renderer.setAttribute(this.document.documentElement, 'dir', dir);
    this.renderer.setAttribute(this.document.documentElement, 'lang', lang);
  }

  private maybeShowLanguageSuggestion(detectedLang: string): void {
    // Check if user has previously dismissed suggestions
    const suggestionDismissed = localStorage.getItem('localink_lang_suggestion_dismissed');
    if (!suggestionDismissed && detectedLang !== 'en') {
      // The UI component will handle showing the suggestion popup
      // This is a flag that components can check
      localStorage.setItem('localink_lang_detected', detectedLang);
    }
  }
}
