import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

// Type declarations for Web Speech API
declare global {
  interface SpeechRecognition extends EventTarget {
    lang: string;
    continuous: boolean;
    interimResults: boolean;
    start(): void;
    stop(): void;
    onstart: (() => void) | null;
    onresult: ((event: SpeechRecognitionEvent) => void) | null;
    onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
    onend: (() => void) | null;
  }

  interface SpeechRecognitionStatic {
    new (): SpeechRecognition;
  }

  interface SpeechRecognitionEvent extends Event {
    resultIndex: number;
    results: SpeechRecognitionResultList;
  }

  interface SpeechRecognitionErrorEvent extends Event {
    error: string;
    message: string;
  }

  interface Window {
    SpeechRecognition: SpeechRecognitionStatic;
    webkitSpeechRecognition: SpeechRecognitionStatic;
  }
}

export interface VoiceSearchResult {
  query: string;
  openNow: boolean;
  radius: number;
  category?: string;
}

export type VoiceState = 'idle' | 'listening' | 'processing' | 'error';

@Injectable({
  providedIn: 'root'
})
export class VoiceService {
  private recognition: SpeechRecognition | null = null;
  private synthesis: SpeechSynthesis | null = null;
  private restartTimeout: any = null;
  private silenceTimeout: any = null;
  private maxRestarts = 3;
  private restartCount = 0;
  
  private voiceStateSubject = new BehaviorSubject<VoiceState>('idle');
  voiceState$ = this.voiceStateSubject.asObservable();
  
  private transcriptSubject = new Subject<string>();
  transcript$ = this.transcriptSubject.asObservable();
  
  private interimTranscriptSubject = new Subject<string>();
  interimTranscript$ = this.interimTranscriptSubject.asObservable();
  
  private finalTranscriptSubject = new Subject<string>();
  finalTranscript$ = this.finalTranscriptSubject.asObservable();
  
  private errorSubject = new Subject<string>();
  error$ = this.errorSubject.asObservable();
  
  private currentLanguage = 'en-US';
  private isListening = false;

  // Language mapping for speech recognition
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
    'zh': 'zh-CN'
  };

  constructor() {
    this.initializeRecognition();
  }

  private initializeRecognition(): void {
    if (!this.isBrowserSupported()) {
      console.warn('Web Speech API not supported in this browser');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.recognition = new SpeechRecognition();
    this.recognition.continuous = true; // Keep listening until explicitly stopped
    this.recognition.interimResults = true;
    this.recognition.lang = this.currentLanguage;

    this.recognition.onstart = () => {
      this.isListening = true;
      this.restartCount = 0;
      this.voiceStateSubject.next('listening');
      
      // Set silence detection timeout (8 seconds - longer for better UX)
      this.clearSilenceTimeout();
      this.silenceTimeout = setTimeout(() => {
        if (this.isListening) {
          this.errorSubject.next('No speech detected. Please try speaking louder or closer to the microphone.');
          this.voiceStateSubject.next('error');
          this.stopListening();
        }
      }, 8000);
    };

    this.recognition.onresult = (event: SpeechRecognitionEvent) => {
      // Clear silence timeout when speech is detected
      this.clearSilenceTimeout();
      
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      // Emit interim transcript for real-time feedback in search bar
      if (interimTranscript) {
        this.interimTranscriptSubject.next(interimTranscript);
        this.transcriptSubject.next(interimTranscript); // Keep backward compatibility
      }

      if (finalTranscript) {
        this.finalTranscriptSubject.next(finalTranscript);
        this.transcriptSubject.next(finalTranscript);
        this.voiceStateSubject.next('processing');
        this.stopListening();
      } else {
        // Set a shorter timeout for final results if we have interim
        this.clearSilenceTimeout();
        this.silenceTimeout = setTimeout(() => {
          if (this.isListening && interimTranscript) {
            // Use interim as final if we've been waiting
            this.finalTranscriptSubject.next(interimTranscript);
            this.transcriptSubject.next(interimTranscript);
            this.voiceStateSubject.next('processing');
            this.stopListening();
          }
        }, 1500);
      }
    };

    this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      this.isListening = false;
      let errorMessage = 'An error occurred during voice recognition';
      
      switch (event.error) {
        case 'no-speech':
          // Don't show error immediately - just restart listening
          if (this.restartCount < this.maxRestarts) {
            this.restartCount++;
            return; // Don't show error, just restart
          }
          errorMessage = 'No speech detected. Please check your microphone and try speaking clearly.';
          break;
        case 'aborted':
          errorMessage = 'Voice recognition was aborted.';
          break;
        case 'audio-capture':
          errorMessage = 'No microphone found. Please check your audio settings.';
          break;
        case 'not-allowed':
          errorMessage = 'Microphone permission denied. Please allow microphone access.';
          break;
        case 'network':
          errorMessage = 'Network error. Please check your internet connection.';
          break;
        case 'service-not-allowed':
          errorMessage = 'Speech recognition service is not allowed.';
          break;
        default:
          errorMessage = `Error: ${event.error}`;
      }
      
      this.errorSubject.next(errorMessage);
      this.voiceStateSubject.next('error');
    };

    this.recognition.onend = () => {
      this.isListening = false;
      this.clearSilenceTimeout();
      
      // Auto-restart if still in listening state (handles Chrome's auto-stop)
      if (this.voiceStateSubject.value === 'listening' && this.restartCount < this.maxRestarts) {
        this.restartCount++;
        this.restartTimeout = setTimeout(() => {
          try {
            this.recognition?.start();
          } catch {
            this.voiceStateSubject.next('idle');
          }
        }, 100);
      } else {
        if (this.voiceStateSubject.value === 'listening') {
          this.voiceStateSubject.next('idle');
        }
      }
    };
  }

  isBrowserSupported(): boolean {
    return 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
  }

  setLanguage(langCode: string): void {
    this.currentLanguage = this.languageMap[langCode] || 'en-US';
    if (this.recognition) {
      this.recognition.lang = this.currentLanguage;
    }
  }

  startListening(): void {
    if (!this.recognition) {
      this.errorSubject.next('Speech recognition is not supported in your browser');
      this.voiceStateSubject.next('error');
      return;
    }

    if (this.isListening) {
      this.stopListening();
    }

    // Request microphone permission first
    this.requestMicrophonePermission().then(granted => {
      if (!granted) {
        this.errorSubject.next('Microphone permission denied. Please allow microphone access.');
        this.voiceStateSubject.next('error');
        return;
      }

      try {
        this.recognition!.start();
      } catch (error) {
        this.errorSubject.next('Failed to start voice recognition. Please try again.');
        this.voiceStateSubject.next('error');
      }
    });
  }

  stopListening(): void {
    this.clearRestartTimeout();
    this.clearSilenceTimeout();
    if (this.recognition && this.isListening) {
      this.recognition.stop();
    }
  }

  private clearRestartTimeout(): void {
    if (this.restartTimeout) {
      clearTimeout(this.restartTimeout);
      this.restartTimeout = null;
    }
  }

  private clearSilenceTimeout(): void {
    if (this.silenceTimeout) {
      clearTimeout(this.silenceTimeout);
      this.silenceTimeout = null;
    }
  }

  parseVoiceCommand(transcript: string): VoiceSearchResult {
    const lowerTranscript = transcript.toLowerCase();
    
    // Parse open now
    const openNowKeywords = ['open now', 'open today', 'currently open', 'working now'];
    const openNow = openNowKeywords.some(keyword => lowerTranscript.includes(keyword));
    
    // Parse radius
    let radius = 5; // Default 5km
    const radiusMatch = lowerTranscript.match(/(\d+)\s*(km|kilometer|kilometers|miles?)/);
    if (radiusMatch) {
      const value = parseInt(radiusMatch[1], 10);
      const unit = radiusMatch[2];
      radius = unit.startsWith('mile') ? Math.round(value * 1.60934) : value;
    }
    
    // Parse category keywords - comprehensive list for better matching
    const categoryKeywords: { [key: string]: string[] } = {
      'restaurant': ['restaurant', 'restaurants', 'food', 'eat', 'eating', 'dining', 'cafe', 'cafeteria', 'biryani', 'dosa', 'idly', 'meals', 'lunch', 'dinner', 'breakfast', 'hotel'],
      'hospital': ['hospital', 'hospitals', 'clinic', 'clinics', 'medical', 'doctor', 'doctors', 'physician', 'surgeon', 'dentist', 'health', 'pharmacy', 'medicine', 'drugstore', 'healthcare'],
      'school': ['school', 'schools', 'college', 'colleges', 'education', 'educational', 'university', 'institute', 'academy', 'coaching', 'classes', 'learning', 'training'],
      'shop': ['shop', 'shops', 'store', 'stores', 'market', 'markets', 'mart', 'retail', 'supermarket', 'mall', 'shopping', 'boutique', 'outlet', 'grocery', 'kirana'],
      'bank': ['bank', 'banks', 'atm', 'atms', 'finance', 'financial', 'money', 'cash', 'credit', 'loan', 'insurance', 'investment'],
      'repair': ['repair', 'repairs', 'service', 'services', 'fix', 'fixing', 'mechanic', 'mechanics', 'workshop', 'garage', 'plumber', 'electrician', 'carpenter', 'technician'],
      'tutoring': ['tutoring', 'tutor', 'tutors', 'coaching', 'coaching center', 'tuition', 'classes', 'learning center', 'education center', 'study center'],
      'beauty': ['salon', 'parlour', 'parlor', 'beauty', 'spa', 'haircut', 'hairdresser', 'barber', 'makeup', 'facial', 'massage'],
      'automotive': ['car', 'cars', 'bike', 'bikes', 'automotive', 'vehicle', 'vehicles', 'motorcycle', 'scooter', 'automobile', 'petrol', 'diesel', 'fuel', 'gas'],
      'electronics': ['electronics', 'mobile', 'phone', 'computer', 'laptop', 'gadget', 'appliances', 'tv', 'refrigerator', 'ac', 'air conditioner', 'washing machine'],
      'real estate': ['property', 'properties', 'real estate', 'house', 'houses', 'flat', 'apartment', 'rent', 'rental', 'lease', 'buy', 'sell'],
      'travel': ['travel', 'travels', 'tour', 'tours', 'tourism', 'hotel', 'hotels', 'lodging', 'stay', 'resort', 'vacation', 'booking'],
      'fitness': ['gym', 'fitness', 'yoga', 'exercise', 'workout', 'sports', 'game', 'stadium', 'pool', 'swimming', 'trainer'],
      'home services': ['cleaning', 'maid', 'servant', 'cook', 'chef', 'catering', 'security', 'guard', 'pest control', 'painting', 'renovation']
    };
    
    let category: string | undefined;
    for (const [cat, keywords] of Object.entries(categoryKeywords)) {
      if (keywords.some(keyword => lowerTranscript.includes(keyword))) {
        category = cat;
        break;
      }
    }
    
    // Clean query - remove parsed keywords
    let query = transcript;
    [...openNowKeywords, ...Object.values(categoryKeywords).flat()]
      .forEach(keyword => {
        query = query.replace(new RegExp(keyword, 'gi'), '');
      });
    query = query.replace(/\d+\s*(km|kilometer|kilometers|miles?)/gi, '');
    query = query.trim();
    
    return {
      query: query || transcript,
      openNow,
      radius,
      category
    };
  }

  reset(): void {
    this.voiceStateSubject.next('idle');
  }

  // Check if microphone permission is granted
  async checkMicrophonePermission(): Promise<PermissionState> {
    try {
      if (navigator.permissions) {
        const result = await navigator.permissions.query({ name: 'microphone' as PermissionName });
        return result.state;
      }
      return 'prompt';
    } catch {
      return 'prompt';
    }
  }

  // Request microphone permission
  async requestMicrophonePermission(): Promise<boolean> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      return true;
    } catch {
      return false;
    }
  }
}
