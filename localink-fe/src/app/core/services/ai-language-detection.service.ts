import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface DetectedLanguage {
  code: string;
  confidence: number;
  name: string;
}

@Injectable({
  providedIn: 'root'
})
export class AiLanguageDetectionService {
  private readonly STORAGE_KEY = 'localink_lang';
  private readonly DETECTED_KEY = 'localink_lang_detected';
  private readonly SUGGESTION_DISMISSED_KEY = 'localink_lang_suggestion_dismissed';
  
  private detectedLanguageSubject = new BehaviorSubject<DetectedLanguage | null>(null);
  public detectedLanguage$: Observable<DetectedLanguage | null> = this.detectedLanguageSubject.asObservable();

  // Extended Indian language mapping with character patterns for detection
  private readonly indianLanguagePatterns: { [key: string]: { code: string; name: string; patterns: RegExp[]; sampleChars: string } } = {
    hindi: { 
      code: 'hi', 
      name: 'Hindi', 
      patterns: [/\p{Script=Devanagari}/u],
      sampleChars: 'अआइईउऊएऐओऔकखगघचछजझटठडढणतथदधनपफबभमयरलवशषसह'
    },
    tamil: { 
      code: 'ta', 
      name: 'Tamil', 
      patterns: [/\p{Script=Tamil}/u],
      sampleChars: 'அஆஇஈஉஊஎஏஐஒஓஔகஙசஜஞடணதநனபமயரலவழளறன'
    },
    telugu: { 
      code: 'te', 
      name: 'Telugu', 
      patterns: [/\p{Script=Telugu}/u],
      sampleChars: 'అఆఇఈఉఊఋఎఏఐఒఓఔకఖగఘఙచఛజఝఞటఠడఢణతథదధనపఫబభమయరఱలవశషసహ'
    },
    kannada: { 
      code: 'kn', 
      name: 'Kannada', 
      patterns: [/\p{Script=Kannada}/u],
      sampleChars: 'ಅಆಇಈಉಊಋಎಏಐಒಓಔಕಖಗಘಙಚಛಜಝಞಟಠಡಢಣತಥದಧನಪಫಬಭಮಯರಱಲವಶಷಸಹ'
    },
    malayalam: { 
      code: 'ml', 
      name: 'Malayalam', 
      patterns: [/\p{Script=Malayalam}/u],
      sampleChars: 'അആഇഈഉഊഋഎഏഐഒഓഔകഖഗഘങചഛജഝഞടഠഡഢണതഥദധനപഫബഭമയരറലളഴവശഷസഹ'
    },
    bengali: { 
      code: 'bn', 
      name: 'Bengali', 
      patterns: [/\p{Script=Bengali}/u],
      sampleChars: 'অআইঈউঊএঐওঔকখগঘঙচছজঝঞটঠডঢণতথদধনপফবভমযরলশষসহ'
    },
    gujarati: { 
      code: 'gu', 
      name: 'Gujarati', 
      patterns: [/\p{Script=Gujarati}/u],
      sampleChars: 'અઆઇઈઉઊએઐઓઔકખગઘઙચછજઝઞટઠડઢણતથદધનપફબભમયરલવશષસહ'
    },
    marathi: { 
      code: 'mr', 
      name: 'Marathi', 
      patterns: [/\p{Script=Devanagari}/u],
      sampleChars: 'अआइईउऊएऐओऔकखगघचछजझटठडढणतथदधनपफबभमयरलवशषसह'
    },
    punjabi: { 
      code: 'pa', 
      name: 'Punjabi', 
      patterns: [/\p{Script=Gurmukhi}/u],
      sampleChars: 'ਅਆਇਈਉਊਏਐਓਔਕਖਗਘਙਚਛਜਝਞਟਠਡਢਣਤਥਦਧਨਪਫਬਭਮਯਰਲਵਸ਼ਸਹ'
    },
    urdu: { 
      code: 'ur', 
      name: 'Urdu', 
      patterns: [/\p{Script=Arabic}/u, /[؀-ۿ]/],
      sampleChars: 'ابتثجحخدذرزسشصضطظعغفقكلمنهوي'
    },
    arabic: { 
      code: 'ar', 
      name: 'Arabic', 
      patterns: [/\p{Script=Arabic}/u, /[؀-ۿ]/],
      sampleChars: 'ابتثجحخدذرزسشصضطظعغفقكلمنهوي'
    },
    assamese: { 
      code: 'as', 
      name: 'Assamese', 
      patterns: [/\p{Script=Bengali}/u],
      sampleChars: 'অআইঈউঊএঐওঔকখগঘঙচছজঝঞটঠডঢণতথদধনপফবভমযৰলৱশষসহ'
    },
    odia: { 
      code: 'or', 
      name: 'Odia', 
      patterns: [/\p{Script=Oriya}/u],
      sampleChars: 'ଅଆଇଈଉଊଏଐଓଔକଖଗଘଙଚଛଜଝଞଟଠଡଢଣତଥଦଧନପଫବଭମଯରଲବଶଷସହ'
    }
  };

  // Language profiles for statistical detection
  private readonly languageProfiles: { [key: string]: { [char: string]: number } } = {};

  constructor(
    private translate: TranslateService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.initializeProfiles();
  }

  private initializeProfiles(): void {
    // Build simple frequency profiles for each Indian language
    Object.entries(this.indianLanguagePatterns).forEach(([lang, data]) => {
      this.languageProfiles[lang] = {};
      const chars = data.sampleChars.split('');
      chars.forEach((char, index) => {
        // Simple frequency based on position (common chars first)
        this.languageProfiles[lang][char] = (chars.length - index) / chars.length;
      });
    });
  }

  /**
   * Detect language from text input using multiple methods
   */
  detectLanguage(text: string): DetectedLanguage | null {
    if (!text || text.trim().length === 0) return null;

    const scores: { [key: string]: number } = {};

    // Method 1: Unicode Script Detection
    Object.entries(this.indianLanguagePatterns).forEach(([lang, data]) => {
      let matchCount = 0;
      let totalChars = 0;

      for (const char of text) {
        if (char.trim()) {
          totalChars++;
          for (const pattern of data.patterns) {
            if (pattern.test(char)) {
              matchCount++;
              break;
            }
          }
        }
      }

      const scriptScore = totalChars > 0 ? matchCount / totalChars : 0;
      scores[lang] = scriptScore * 0.6; // 60% weight to script detection
    });

    // Method 2: Statistical Analysis
    Object.entries(this.languageProfiles).forEach(([lang, profile]) => {
      let score = 0;
      let charCount = 0;

      for (const char of text) {
        if (profile[char]) {
          score += profile[char];
          charCount++;
        }
      }

      const statScore = charCount > 0 ? score / charCount : 0;
      scores[lang] = (scores[lang] || 0) + statScore * 0.4; // 40% weight to statistical
    });

    // Find best match
    let bestLang: string | null = null;
    let bestScore = 0;

    Object.entries(scores).forEach(([lang, score]) => {
      if (score > bestScore) {
        bestScore = score;
        bestLang = lang;
      }
    });

    // Minimum confidence threshold
    if (bestLang && bestScore > 0.3) {
      const result = {
        code: this.indianLanguagePatterns[bestLang].code,
        name: this.indianLanguagePatterns[bestLang].name,
        confidence: Math.min(bestScore * 100, 100)
      };
      
      this.detectedLanguageSubject.next(result);
      return result;
    }

    return null;
  }

  /**
   * Auto-detect from browser settings and user context
   */
  autoDetectLanguage(): DetectedLanguage | null {
    if (!isPlatformBrowser(this.platformId)) return null;

    // Check if user has already set a preference
    const savedLang = localStorage.getItem(this.STORAGE_KEY);
    if (savedLang) {
      // User has already chosen, don't override
      return null;
    }

    // Check if suggestion was previously dismissed
    const dismissed = localStorage.getItem(this.SUGGESTION_DISMISSED_KEY);
    if (dismissed) {
      return null;
    }

    // Get browser language
    const browserLang = navigator.language || (navigator as any).userLanguage;
    const primaryLang = browserLang?.split('-')[0].toLowerCase();

    // Map browser languages to our supported codes
    const langMap: { [key: string]: string } = {
      'hi': 'Hindi', 'ta': 'Tamil', 'te': 'Telugu', 'kn': 'Kannada',
      'ml': 'Malayalam', 'bn': 'Bengali', 'gu': 'Gujarati', 'mr': 'Marathi',
      'pa': 'Punjabi', 'ur': 'Urdu', 'ar': 'Arabic', 'as': 'Assamese',
      'or': 'Odia', 'ne': 'Nepali', 'sa': 'Sanskrit', 'sat': 'Santali',
      'kok': 'Konkani', 'ks': 'Kashmiri', 'mni': 'Manipuri', 'mai': 'Maithili',
      'brx': 'Bodo', 'doi': 'Dogri'
    };

    if (primaryLang && langMap[primaryLang]) {
      const result = {
        code: primaryLang,
        name: langMap[primaryLang],
        confidence: 80
      };
      
      // Store detected language for UI to show suggestion
      localStorage.setItem(this.DETECTED_KEY, JSON.stringify(result));
      this.detectedLanguageSubject.next(result);
      return result;
    }

    return null;
  }

  /**
   * Get the currently detected language from storage
   */
  getDetectedLanguage(): DetectedLanguage | null {
    if (!isPlatformBrowser(this.platformId)) return null;
    
    const stored = localStorage.getItem(this.DETECTED_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return null;
      }
    }
    return null;
  }

  /**
   * Clear detected language and dismiss suggestions
   */
  dismissSuggestion(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    
    localStorage.removeItem(this.DETECTED_KEY);
    localStorage.setItem(this.SUGGESTION_DISMISSED_KEY, 'true');
    this.detectedLanguageSubject.next(null);
  }

  /**
   * Reset suggestion dismissal (for testing or reset preferences)
   */
  resetSuggestionPreference(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    
    localStorage.removeItem(this.SUGGESTION_DISMISSED_KEY);
    localStorage.removeItem(this.DETECTED_KEY);
  }

  /**
   * Apply detected language
   */
  applyDetectedLanguage(langCode: string): void {
    if (!isPlatformBrowser(this.platformId)) return;
    
    this.translate.use(langCode);
    localStorage.setItem(this.STORAGE_KEY, langCode);
    this.dismissSuggestion();
  }

  /**
   * Detect from any page content
   */
  detectFromPageContent(): DetectedLanguage | null {
    if (!isPlatformBrowser(this.platformId)) return null;
    
    // Get text from common content areas
    const selectors = ['h1', 'h2', 'h3', 'p', 'span', 'div'];
    let combinedText = '';
    
    selectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(el => {
        const text = el.textContent || '';
        // Filter for Indian scripts
        if (/[\u0900-\u0D7F\u0780-\u07BF\u0600-\u06FF]/.test(text)) {
          combinedText += ' ' + text;
        }
      });
    });
    
    if (combinedText.trim().length > 10) {
      return this.detectLanguage(combinedText);
    }
    
    return null;
  }
}
