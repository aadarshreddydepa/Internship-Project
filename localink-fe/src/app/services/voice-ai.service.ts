import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, Subject, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { VoiceService as LegacyVoiceService } from './voice.service';

/**
 * Voice Process Result from backend AI Gateway
 */
export interface VoiceProcessResult {
  success: boolean;
  message: string;
  transcript: string | null;
  language?: string;
  usedFallback: boolean;
  intent?: {
    action: string;
    category?: string;
    query?: string;
    openNow: boolean;
    radiusKm?: number;
  };
  searchResults?: any[];
  totalResults?: number;
  suggestion?: string;
}

/**
 * Voice State for UI feedback
 */
export type VoiceAIState = 'idle' | 'recording' | 'uploading' | 'processing' | 'success' | 'error' | 'fallback';

/**
 * Unified AI Voice Service
 * Integrates with backend AIGatewayService for speech-to-text and intent parsing
 * Falls back to browser speech recognition if backend fails
 */
@Injectable({
  providedIn: 'root'
})
export class VoiceAIService {
  private baseUrl = 'http://localhost:5138/api/v1/voice';
  
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private recordedBlob: Blob | null = null;
  
  // State management
  private voiceStateSubject = new BehaviorSubject<VoiceAIState>('idle');
  voiceState$ = this.voiceStateSubject.asObservable();
  
  // Transcript streaming
  private transcriptSubject = new Subject<string>();
  transcript$ = this.transcriptSubject.asObservable();
  
  // Results
  private resultSubject = new Subject<VoiceProcessResult>();
  result$ = this.resultSubject.asObservable();
  
  // Errors
  private errorSubject = new Subject<string>();
  error$ = this.errorSubject.asObservable();
  
  // Fallback mode indicator
  private usingFallbackSubject = new BehaviorSubject<boolean>(false);
  usingFallback$ = this.usingFallbackSubject.asObservable();

  constructor(
    private http: HttpClient,
    private translate: TranslateService,
    private legacyVoiceService: LegacyVoiceService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    // Subscribe to legacy voice service for fallback mode
    this.legacyVoiceService.finalTranscript$.subscribe(transcript => {
      if (this.usingFallbackSubject.value && transcript) {
        this.processTextFallback(transcript);
      }
    });
    
    this.legacyVoiceService.error$.subscribe(error => {
      if (this.usingFallbackSubject.value) {
        this.errorSubject.next(error);
        this.voiceStateSubject.next('error');
      }
    });
  }

  /**
   * Check if browser supports MediaRecorder for backend processing
   */
  supportsBackendVoice(): boolean {
    return isPlatformBrowser(this.platformId) && 
           typeof MediaRecorder !== 'undefined' && 
           typeof navigator.mediaDevices !== 'undefined';
  }

  /**
   * Start voice recording for backend processing
   */
  async startRecording(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) {
      this.errorSubject.next('Voice recording not available');
      return;
    }

    try {
      // Reset state
      this.audioChunks = [];
      this.recordedBlob = null;
      this.usingFallbackSubject.next(false);
      
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        } 
      });

      // Try to use webm/opus codec for smaller file size
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : 'audio/webm';

      this.mediaRecorder = new MediaRecorder(stream, { mimeType });

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.onstop = () => {
        this.recordedBlob = new Blob(this.audioChunks, { type: mimeType });
        stream.getTracks().forEach(track => track.stop());
        
        if (this.recordedBlob.size > 0) {
          this.uploadAudio();
        } else {
          this.errorSubject.next('No audio recorded');
          this.voiceStateSubject.next('error');
        }
      };

      this.mediaRecorder.onerror = (event) => {
        this.errorSubject.next('Recording error occurred');
        this.voiceStateSubject.next('error');
        this.stopRecording();
      };

      // Start recording
      this.mediaRecorder.start(100); // Collect data every 100ms
      this.voiceStateSubject.next('recording');
      
    } catch (error) {
      console.error('Failed to start recording:', error);
      
      // If permission denied or no microphone, try fallback
      if (error instanceof DOMException && (error.name === 'NotAllowedError' || error.name === 'NotFoundError')) {
        this.enableFallbackMode();
      } else {
        this.errorSubject.next('Could not access microphone. Please check permissions.');
        this.voiceStateSubject.next('error');
      }
    }
  }

  /**
   * Stop voice recording
   */
  stopRecording(): void {
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.voiceStateSubject.next('uploading');
      this.mediaRecorder.stop();
    } else if (this.usingFallbackSubject.value) {
      this.legacyVoiceService.stopListening();
    }
  }

  /**
   * Upload recorded audio to backend for AI processing
   */
  private uploadAudio(): void {
    if (!this.recordedBlob) {
      this.errorSubject.next('No audio to process');
      this.voiceStateSubject.next('error');
      return;
    }

    // Check file size (max 10MB)
    if (this.recordedBlob.size > 10 * 1024 * 1024) {
      this.errorSubject.next('Recording too long. Please try a shorter query.');
      this.voiceStateSubject.next('error');
      return;
    }

    this.voiceStateSubject.next('processing');

    // Get current language
    const currentLang = this.translate.currentLang || 
                        localStorage.getItem('localink_lang') || 
                        'en';

    // Create form data
    const formData = new FormData();
    formData.append('audioFile', this.recordedBlob, 'recording.webm');
    formData.append('language', currentLang);

    // Get user location for headers
    const headers = this.getLocationHeaders();

    // Upload to backend
    this.http.post<VoiceProcessResult>(`${this.baseUrl}/process`, formData, { headers })
      .pipe(
        tap(result => {
          if (result.success && result.transcript) {
            this.transcriptSubject.next(result.transcript);
          }
        }),
        catchError(error => {
          console.error('Voice processing error:', error);
          
          // If backend fails, suggest fallback
          if (error.status === 503 || error.status === 0) {
            this.errorSubject.next('AI service temporarily unavailable. Switching to browser voice recognition...');
            this.enableFallbackMode();
          } else {
            this.errorSubject.next(error.error?.message || 'Failed to process voice. Please try again.');
            this.voiceStateSubject.next('error');
          }
          
          return of({ 
            success: false, 
            message: 'Processing failed',
            transcript: null,
            usedFallback: false
          } as VoiceProcessResult);
        })
      )
      .subscribe(result => {
        if (result.success) {
          this.resultSubject.next(result);
          this.voiceStateSubject.next('success');
        } else if (!this.usingFallbackSubject.value) {
          this.voiceStateSubject.next('error');
        }
      });
  }

  /**
   * Process text directly (for browser fallback or manual input)
   */
  processText(text: string): Observable<VoiceProcessResult> {
    if (!text.trim()) {
      return of({
        success: false,
        message: 'No text provided',
        transcript: null,
        usedFallback: false
      });
    }

    const currentLang = this.translate.currentLang || 
                        localStorage.getItem('localink_lang') || 
                        'en';

    const headers = this.getLocationHeaders();

    return this.http.post<VoiceProcessResult>(`${this.baseUrl}/process-text`, {
      text: text.trim(),
      language: currentLang
    }, { headers }).pipe(
      tap(result => {
        this.resultSubject.next(result);
        if (result.success) {
          this.voiceStateSubject.next('success');
        }
      }),
      catchError(error => {
        this.errorSubject.next(error.error?.message || 'Failed to process text');
        this.voiceStateSubject.next('error');
        return of({
          success: false,
          message: error.error?.message || 'Processing failed',
          transcript: text,
          usedFallback: true
        });
      })
    );
  }

  /**
   * Enable browser speech recognition as fallback
   */
  enableFallbackMode(): void {
    this.usingFallbackSubject.next(true);
    this.voiceStateSubject.next('fallback');
    
    // Set language for legacy voice service
    const currentLang = this.translate.currentLang || 
                        localStorage.getItem('localink_lang') || 
                        'en';
    this.legacyVoiceService.setLanguage(currentLang);
    
    // Start legacy voice service
    this.legacyVoiceService.startListening();
    this.voiceStateSubject.next('recording');
  }

  /**
   * Process text using fallback (send to backend intent parsing)
   */
  private processTextFallback(text: string): void {
    this.voiceStateSubject.next('processing');
    this.processText(text).subscribe();
  }

  /**
   * Check if voice service is healthy
   */
  healthCheck(): Observable<boolean> {
    return this.http.get<{ status: string }>(`${this.baseUrl}/health`)
      .pipe(
        map(response => response.status === 'healthy'),
        catchError(() => of(false))
      );
  }

  /**
   * Reset voice state
   */
  reset(): void {
    this.voiceStateSubject.next('idle');
    this.usingFallbackSubject.next(false);
    this.legacyVoiceService.reset();
    
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
    }
    
    this.audioChunks = [];
    this.recordedBlob = null;
  }

  /**
   * Get current voice state
   */
  getCurrentState(): VoiceAIState {
    return this.voiceStateSubject.value;
  }

  /**
   * Check if currently recording
   */
  isRecording(): boolean {
    return this.voiceStateSubject.value === 'recording' ||
           this.voiceStateSubject.value === 'fallback';
  }

  private getLocationHeaders(): HttpHeaders {
    let headers = new HttpHeaders();
    
    const storedLocation = localStorage.getItem('localink_location');
    if (storedLocation) {
      try {
        const location = JSON.parse(storedLocation);
        if (location?.lat && location?.lng) {
          headers = headers.set('X-User-Latitude', location.lat.toString())
                          .set('X-User-Longitude', location.lng.toString());
        }
      } catch {
        // Invalid stored location
      }
    }
    
    return headers;
  }
}
