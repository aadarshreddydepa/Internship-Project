import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class TtsService {
  private synthesis: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private isEnabledSubject = new BehaviorSubject<boolean>(true);
  isEnabled$ = this.isEnabledSubject.asObservable();

  // Language mapping for TTS
  private languageMap: { [key: string]: string } = {
    'en': 'en-US',
    'hi': 'hi-IN',
    'ta': 'ta-IN',
    'te': 'te-IN',
    'bn': 'bn-IN',
    'mr': 'mr-IN',
    'gu': 'gu-IN',
    'kn': 'kn-IN',
    'ml': 'ml-IN',
    'pa': 'pa-IN',
    'ur': 'ur-PK',
    'ar': 'ar-SA',
    'de': 'de-DE',
    'es': 'es-ES',
    'fr': 'fr-FR',
    'it': 'it-IT',
    'ja': 'ja-JP',
    'ko': 'ko-KR',
    'pt': 'pt-PT',
    'ru': 'ru-RU',
    'zh': 'zh-CN',
    'sd': 'sd-IN',
    'kok': 'kok-IN',
    'doi': 'doi-IN',
    'ne': 'ne-NP',
    'sa': 'sa-IN',
    'sat': 'sat-IN',
    'ks': 'ks-IN',
    'mni': 'mni-IN',
    'mai': 'mai-IN',
    'brx': 'brx-IN',
    'as': 'as-IN',
    'or': 'or-IN'
  };

  private currentLanguage = 'en-US';

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    if (isPlatformBrowser(this.platformId)) {
      this.synthesis = window.speechSynthesis;
      this.loadPreference();
    }
  }

  private loadPreference(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const saved = localStorage.getItem('localink_tts_enabled');
    if (saved !== null) {
      this.isEnabledSubject.next(saved === 'true');
    }
  }

  isBrowserSupported(): boolean {
    return 'speechSynthesis' in window;
  }

  setLanguage(langCode: string): void {
    this.currentLanguage = this.languageMap[langCode] || 'en-US';
  }

  speak(text: string, priority: 'high' | 'normal' = 'normal'): void {
    if (!this.isEnabledSubject.value || !this.isBrowserSupported()) {
      return;
    }

    // Cancel any ongoing speech for high priority messages
    if (priority === 'high') {
      this.stop();
    }

    // Don't queue multiple normal priority messages
    if (priority === 'normal' && this.synthesis?.speaking) {
      return;
    }

    this.currentUtterance = new SpeechSynthesisUtterance(text);
    this.currentUtterance.lang = this.currentLanguage;
    this.currentUtterance.rate = 1.0;
    this.currentUtterance.pitch = 1.0;
    this.currentUtterance.volume = 0.8;

    // Try to find a voice matching the language
    const voices = this.synthesis?.getVoices() || [];
    const matchingVoice = voices.find(voice => 
      voice.lang.toLowerCase().startsWith(this.currentLanguage.toLowerCase())
    );
    if (matchingVoice) {
      this.currentUtterance.voice = matchingVoice;
    }

    this.currentUtterance.onerror = (event) => {
      console.error('TTS Error:', event.error);
    };

    this.synthesis?.speak(this.currentUtterance);
  }

  stop(): void {
    if (this.synthesis?.speaking) {
      this.synthesis?.cancel();
    }
  }

  pause(): void {
    if (this.synthesis?.speaking && !this.synthesis?.paused) {
      this.synthesis?.pause();
    }
  }

  resume(): void {
    if (this.synthesis?.paused) {
      this.synthesis?.resume();
    }
  }

  toggle(): void {
    const newState = !this.isEnabledSubject.value;
    this.isEnabledSubject.next(newState);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('localink_tts_enabled', String(newState));
    }
    
    if (!newState) {
      this.stop();
    }
  }

  setEnabled(enabled: boolean): void {
    this.isEnabledSubject.next(enabled);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('localink_tts_enabled', String(enabled));
    }
    
    if (!enabled) {
      this.stop();
    }
  }

  // Predefined messages for common scenarios
  announceSearchResults(count: number, query: string): void {
    const messages: { [key: string]: string } = {
      'en': `Found ${count} results for ${query}`,
      'hi': `${query} के लिए ${count} परिणाम मिले`,
      'ta': `${query}க்கு ${count} முடிவுகள் கிடைத்தன`,
      'te': `${query} కోసం ${count} ఫలితాలు దొరికాయి`,
      'bn': `${query} এর জন্য ${count}টি ফলাফল পাওয়া গেছে`,
      'ur': `${query} کے لیے ${count} نتائج ملے`
    };
    
    const langCode = this.currentLanguage.split('-')[0];
    const message = messages[langCode] || messages['en'];
    this.speak(message, 'normal');
  }

  announceNavigation(destination: string): void {
    const messages: { [key: string]: string } = {
      'en': `Navigating to ${destination}`,
      'hi': `${destination} पर नेविगेट कर रहे हैं`,
      'ta': `${destination}க்கு வழிசெலுத்துகிறது`,
      'te': `${destination}కి మారుతోంది`
    };
    
    const langCode = this.currentLanguage.split('-')[0];
    const message = messages[langCode] || messages['en'];
    this.speak(message, 'high');
  }

  announceError(error: string): void {
    this.speak(`Error: ${error}`, 'high');
  }

  announceSuccess(message: string): void {
    this.speak(message, 'normal');
  }

  // Get available voices
  getVoices(): SpeechSynthesisVoice[] {
    return this.synthesis?.getVoices() || [];
  }
}
