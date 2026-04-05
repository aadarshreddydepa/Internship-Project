import { Component, Inject, PLATFORM_ID, OnInit, OnDestroy, ElementRef, HostListener } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';

interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  isRTL: boolean;
}

@Component({
  selector: 'app-language-switcher',
  standalone: true,
  imports: [CommonModule, TranslateModule, FormsModule],
  template: `
    <!-- Floating Trigger Button -->
    <button 
      class="language-sidebar-trigger"
      (click)="toggleSidebar()"
      [attr.aria-label]="'LANGUAGE.SELECT' | translate"
      [class.active]="isOpen">
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/>
        <path d="M2 12h20"/>
      </svg>
      <span class="current-lang">{{ getCurrentLanguage().nativeName }}</span>
    </button>

    <!-- Overlay -->
    <div 
      class="language-sidebar-overlay" 
      *ngIf="isOpen" 
      (click)="closeSidebar()"
      aria-hidden="true">
    </div>

    <!-- Right Side Sidebar -->
    <div 
      class="language-sidebar" 
      [class.open]="isOpen"
      role="dialog"
      aria-modal="true"
      [attr.aria-label]="'LANGUAGE.SELECT' | translate">
      
      <!-- Sidebar Header -->
      <div class="sidebar-header">
        <h3>{{ 'LANGUAGE.SELECT' | translate }}</h3>
        <button 
          class="close-btn"
          (click)="closeSidebar()"
          [attr.aria-label]="'COMMON.CLOSE' | translate">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      <!-- Search Box -->
      <div class="language-search">
        <input 
          type="text"
          [(ngModel)]="searchTerm"
          (ngModelChange)="filterLanguages()"
          placeholder="{{ 'LANGUAGE.SEARCH_PLACEHOLDER' | translate }}"
          aria-label="Search languages">
        <svg class="search-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8"/>
          <path d="m21 21-4.35-4.35"/>
        </svg>
      </div>

      <!-- Language List -->
      <div class="sidebar-content" role="listbox" [attr.aria-label]="'LANGUAGE.SELECT' | translate">
        <button 
          *ngFor="let lang of filteredLanguages"
          class="language-option"
          [class.active]="currentLang === lang.code"
          [class.rtl]="lang.isRTL"
          (click)="selectLanguage(lang.code)"
          role="option"
          [attr.aria-selected]="currentLang === lang.code"
          tabindex="0"
          (keydown)="onLanguageKeydown($event, lang.code)">
          <span class="lang-flag">{{ lang.flag }}</span>
          <div class="lang-info">
            <span class="lang-native">{{ lang.nativeName }}</span>
            <span class="lang-name">{{ lang.name }}</span>
          </div>
          <svg *ngIf="currentLang === lang.code" class="check-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </button>

        <!-- No Results -->
        <div *ngIf="filteredLanguages.length === 0" class="no-results">
          {{ 'LANGUAGE.NO_RESULTS' | translate }}
        </div>
      </div>

      <!-- Sidebar Footer -->
      <div class="sidebar-footer">
        <p>{{ filteredLanguages.length }} {{ 'LANGUAGE.AVAILABLE' | translate }}</p>
      </div>
    </div>
  `,
  styles: [`
    /* Trigger Button - Normal Position (scrolls with page) */
    .language-sidebar-trigger {
      position: relative;
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 16px;
      border: 1px solid rgba(200, 169, 126, 0.4);
      border-radius: 50px;
      background: rgba(26, 26, 26, 0.95);
      color: #c8a97e;
      font-size: 14px;
      cursor: pointer;
      transition: all 0.3s ease;
      outline: none;
      backdrop-filter: blur(10px);
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
    }
    
    .language-sidebar-trigger:hover {
      border-color: #c8a97e;
      background: rgba(200, 169, 126, 0.1);
      transform: translateY(-2px);
      box-shadow: 0 6px 24px rgba(200, 169, 126, 0.2);
    }
    
    .language-sidebar-trigger.active {
      border-color: #c8a97e;
      background: rgba(200, 169, 126, 0.2);
    }
    
    .language-sidebar-trigger svg {
      flex-shrink: 0;
    }
    
    .current-lang {
      max-width: 80px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    
    /* Overlay */
    .language-sidebar-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.6);
      z-index: 9998;
      animation: fadeIn 0.3s ease;
    }
    
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    
    /* Right Sidebar */
    .language-sidebar {
      position: fixed;
      top: 0;
      right: 0;
      width: 350px;
      max-width: 90vw;
      height: 100vh;
      background: #1a1a1a;
      border-left: 1px solid rgba(200, 169, 126, 0.3);
      z-index: 9999;
      display: flex;
      flex-direction: column;
      transform: translateX(100%);
      transition: transform 0.3s ease;
      box-shadow: -8px 0 32px rgba(0, 0, 0, 0.5);
    }
    
    .language-sidebar.open {
      transform: translateX(0);
    }
    
    /* Sidebar Header */
    .sidebar-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 20px 24px;
      border-bottom: 1px solid rgba(200, 169, 126, 0.2);
      background: #1f1f1f;
    }
    
    .sidebar-header h3 {
      margin: 0;
      color: #c8a97e;
      font-size: 18px;
      font-weight: 500;
    }
    
    .close-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      border: none;
      border-radius: 50%;
      background: rgba(200, 169, 126, 0.1);
      color: #c8a97e;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    
    .close-btn:hover {
      background: rgba(200, 169, 126, 0.2);
      transform: rotate(90deg);
    }
    
    /* Search Box */
    .language-search {
      position: relative;
      padding: 16px 24px;
      border-bottom: 1px solid rgba(200, 169, 126, 0.1);
    }
    
    .language-search input {
      width: 100%;
      padding: 12px 16px 12px 44px;
      border: 1px solid rgba(200, 169, 126, 0.3);
      border-radius: 8px;
      background: #252525;
      color: #e0e0e0;
      font-size: 14px;
      outline: none;
      transition: all 0.2s ease;
    }
    
    .language-search input:focus {
      border-color: #c8a97e;
      box-shadow: 0 0 0 3px rgba(200, 169, 126, 0.1);
    }
    
    .language-search input::placeholder {
      color: #666;
    }
    
    .search-icon {
      position: absolute;
      left: 40px;
      top: 50%;
      transform: translateY(-50%);
      color: #666;
      pointer-events: none;
    }
    
    /* Sidebar Content - Scrollable */
    .sidebar-content {
      flex: 1;
      overflow-y: auto;
      padding: 8px;
    }
    
    /* Scrollbar Styling */
    .sidebar-content::-webkit-scrollbar {
      width: 6px;
    }
    
    .sidebar-content::-webkit-scrollbar-track {
      background: transparent;
    }
    
    .sidebar-content::-webkit-scrollbar-thumb {
      background: rgba(200, 169, 126, 0.3);
      border-radius: 3px;
    }
    
    .sidebar-content::-webkit-scrollbar-thumb:hover {
      background: rgba(200, 169, 126, 0.5);
    }
    
    /* Language Options */
    .language-option {
      display: flex;
      align-items: center;
      gap: 12px;
      width: 100%;
      padding: 14px 16px;
      margin-bottom: 4px;
      border: none;
      border-radius: 8px;
      background: transparent;
      color: #e0e0e0;
      font-size: 14px;
      text-align: left;
      cursor: pointer;
      transition: all 0.2s ease;
      outline: none;
    }
    
    .language-option:hover,
    .language-option:focus {
      background: rgba(200, 169, 126, 0.1);
      outline: 2px solid rgba(200, 169, 126, 0.3);
      outline-offset: -2px;
    }
    
    .language-option.active {
      background: rgba(200, 169, 126, 0.2);
      color: #c8a97e;
    }
    
    .language-option.rtl {
      direction: rtl;
      text-align: right;
    }
    
    .lang-flag {
      font-size: 24px;
      flex-shrink: 0;
    }
    
    .lang-info {
      display: flex;
      flex-direction: column;
      flex: 1;
      min-width: 0;
    }
    
    .lang-native {
      font-weight: 500;
      font-size: 15px;
      color: #f0f0f0;
    }
    
    .lang-name {
      color: #888;
      font-size: 12px;
      margin-top: 2px;
    }
    
    .check-icon {
      flex-shrink: 0;
      color: #c8a97e;
    }
    
    .no-results {
      padding: 40px 24px;
      text-align: center;
      color: #666;
      font-size: 14px;
    }
    
    /* Sidebar Footer */
    .sidebar-footer {
      padding: 16px 24px;
      border-top: 1px solid rgba(200, 169, 126, 0.1);
      background: #1f1f1f;
      text-align: center;
    }
    
    .sidebar-footer p {
      margin: 0;
      color: #666;
      font-size: 12px;
    }
    
    /* Responsive */
    @media (max-width: 768px) {
      .language-sidebar {
        width: 100%;
        max-width: 100%;
      }
      
      .language-sidebar-trigger {
        padding: 8px 12px;
      }
      
      .current-lang {
        display: none;
      }
    }
    
    /* Reduced Motion */
    @media (prefers-reduced-motion: reduce) {
      .language-sidebar,
      .language-sidebar-trigger,
      .language-option,
      .close-btn {
        transition: none;
      }
      
      .close-btn:hover {
        transform: none;
      }
    }
  `]
})
export class LanguageSwitcherComponent implements OnInit, OnDestroy {
  currentLang: string = 'en';
  isOpen: boolean = false;
  searchTerm: string = '';
  filteredLanguages: Language[] = [];

  // Language definitions with flags
  languages: Language[] = [
    { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸', isRTL: false },
    { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳', isRTL: false },
    { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵', isRTL: false },
    { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪', isRTL: false },
    { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷', isRTL: false },
    { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸', isRTL: false },
    { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹', isRTL: false },
    { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺', isRTL: false },
    { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷', isRTL: false },
    { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹', isRTL: false },
    { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', isRTL: true },
    { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳', isRTL: false },
    { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', flag: '🇮🇳', isRTL: false },
    { code: 'sd', name: 'Sindhi', nativeName: 'سنڌي', flag: '🇵🇰', isRTL: true },
    { code: 'ur', name: 'Urdu', nativeName: 'اردو', flag: '🇵🇰', isRTL: true },
    { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', flag: '🇮🇳', isRTL: false },
    { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', flag: '🇧🇩', isRTL: false },
    { code: 'mr', name: 'Marathi', nativeName: 'मराठी', flag: '🇮🇳', isRTL: false },
    { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', flag: '🇮🇳', isRTL: false },
    { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', flag: '🇮🇳', isRTL: false },
    { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', flag: '🇮🇳', isRTL: false },
    { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', flag: '🇮🇳', isRTL: false },
    { code: 'as', name: 'Assamese', nativeName: 'অসমীয়া', flag: '🇮🇳', isRTL: false },
    { code: 'or', name: 'Odia', nativeName: 'ଓଡ଼ିଆ', flag: '🇮🇳', isRTL: false },
    { code: 'ne', name: 'Nepali', nativeName: 'नेपाली', flag: '🇳🇵', isRTL: false },
    { code: 'sa', name: 'Sanskrit', nativeName: 'संस्कृतम्', flag: '🇮🇳', isRTL: false },
    { code: 'sat', name: 'Santali', nativeName: 'ᱥᱟᱱᱛᱟᱲᱤ', flag: '🇮🇳', isRTL: false },
    { code: 'kok', name: 'Konkani', nativeName: 'कोंकणी', flag: '🇮🇳', isRTL: false },
    { code: 'ks', name: 'Kashmiri', nativeName: 'کٲشُر', flag: '🇮🇳', isRTL: true },
    { code: 'mni', name: 'Manipuri', nativeName: 'মৈতৈলোন্', flag: '🇮🇳', isRTL: false },
    { code: 'mai', name: 'Maithili', nativeName: 'मैथिली', flag: '🇮🇳', isRTL: false },
    { code: 'brx', name: 'Bodo', nativeName: 'बड़ो', flag: '🇮🇳', isRTL: false },
    { code: 'doi', name: 'Dogri', nativeName: 'डोगरी', flag: '🇮🇳', isRTL: false },
    { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷', isRTL: false },
    { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', flag: '🇻🇳', isRTL: false }
  ];

  // RTL languages
  private readonly rtlLangs = ['ar', 'sd', 'ur', 'ks'];

  constructor(
    private translate: TranslateService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private elementRef: ElementRef
  ) {
    this.filteredLanguages = [...this.languages];
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      const savedLang = localStorage.getItem('localink_lang');
      if (savedLang) {
        this.currentLang = savedLang;
      }
    }
  }

  ngOnDestroy(): void {
    // Cleanup if needed
  }

  @HostListener('document:keydown.escape', ['$event'])
  onEscapePress(event: KeyboardEvent): void {
    if (this.isOpen) {
      this.closeSidebar();
    }
  }

  toggleSidebar(): void {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.searchTerm = '';
      this.filteredLanguages = [...this.languages];
      // Focus the search input after opening
      setTimeout(() => {
        const searchInput = this.elementRef.nativeElement.querySelector('.language-search input');
        if (searchInput) {
          searchInput.focus();
        }
      }, 100);
    }
  }

  closeSidebar(): void {
    this.isOpen = false;
  }

  filterLanguages(): void {
    const term = this.searchTerm.toLowerCase().trim();
    if (!term) {
      this.filteredLanguages = [...this.languages];
    } else {
      this.filteredLanguages = this.languages.filter(lang => 
        lang.name.toLowerCase().includes(term) ||
        lang.nativeName.toLowerCase().includes(term) ||
        lang.code.toLowerCase().includes(term)
      );
    }
  }

  onLanguageKeydown(event: KeyboardEvent, langCode: string): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.selectLanguage(langCode);
    }
  }

  selectLanguage(langCode: string): void {
    this.currentLang = langCode;
    this.translate.use(langCode);
    
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('localink_lang', langCode);
      
      // Update document direction for RTL support
      const dir = this.rtlLangs.includes(langCode) ? 'rtl' : 'ltr';
      document.documentElement.dir = dir;
      document.documentElement.lang = langCode;
    }
    
    this.closeSidebar();
  }

  getCurrentLanguage(): Language {
    return this.languages.find(lang => lang.code === this.currentLang) || this.languages[0];
  }
}
