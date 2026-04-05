import { Component, OnInit, OnDestroy, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VoiceAIService, VoiceAIState, VoiceProcessResult } from '../../services/voice-ai.service';
import { VoiceService } from '../../services/voice.service';
import { GeolocationService, GeoLocation } from '../../services/geolocation.service';
import { TtsService } from '../../services/tts.service';
import { SoundService } from '../../services/sound.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

/**
 * Enhanced Voice Search Component with AI Gateway Integration
 * Uses backend AIGatewayService for speech-to-text and intent parsing
 * Falls back to browser speech recognition when backend is unavailable
 */
@Component({
  selector: 'app-ai-voice-search',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  template: `
    <div class="voice-search-container" [class.expanded]="isExpanded">
      <!-- Main Voice Button -->
      <button 
        class="voice-btn"
        [class.listening]="isRecording"
        [class.processing]="isProcessing"
        [class.error]="isError"
        [class.fallback]="usingFallback"
        (click)="toggleVoiceSearch()"
        [attr.aria-label]="getStateLabel() | translate"
        [disabled]="isProcessing">
        <div class="voice-icon">
          <svg *ngIf="!isRecording && !isProcessing" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3Z"/>
            <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
            <line x1="12" y1="19" x2="12" y2="22"/>
          </svg>
          <svg *ngIf="isRecording" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="6" y="6" width="12" height="12" rx="2"/>
          </svg>
          <svg *ngIf="isProcessing" class="spinning" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 6v6l4 2"/>
          </svg>
        </div>
        
        <!-- Recording Animation -->
        <div class="recording-waves" *ngIf="isRecording">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </button>

      <!-- Status Text -->
      <div class="voice-status" *ngIf="showStateText">
        <span class="state-text">{{ getStateText() | translate }}</span>
        <span class="fallback-badge" *ngIf="usingFallback">
          {{ 'VOICE.FALLBACK_MODE' | translate }}
        </span>
      </div>

      <!-- Transcript Preview -->
      <div class="voice-preview" *ngIf="showPreview && (transcript || errorMessage)">
        <div class="transcript" *ngIf="transcript && !errorMessage">
          <span class="label">{{ 'VOICE.HEARD' | translate }}:</span>
          <span class="text">"{{ transcript }}"</span>
        </div>
        
        <div class="error-message" *ngIf="errorMessage">
          <span class="icon">⚠️</span>
          <span class="text">{{ errorMessage }}</span>
        </div>

        <!-- AI Intent Preview -->
        <div class="intent-preview" *ngIf="lastResult?.intent">
          <div class="intent-item" *ngIf="lastResult.intent.query">
            <span class="label">{{ 'VOICE.QUERY' | translate }}:</span>
            <span class="value">{{ lastResult.intent.query }}</span>
          </div>
          <div class="intent-item" *ngIf="lastResult.intent.category">
            <span class="label">{{ 'VOICE.CATEGORY' | translate }}:</span>
            <span class="value">{{ lastResult.intent.category }}</span>
          </div>
          <div class="intent-badges">
            <span class="badge open-now" *ngIf="lastResult.intent.openNow">
              {{ 'VOICE.OPEN_NOW' | translate }}
            </span>
            <span class="badge radius" *ngIf="lastResult.intent.radiusKm">
              {{ lastResult.intent.radiusKm }}km
            </span>
          </div>
        </div>

        <!-- Search Results Preview -->
        <div class="results-preview" *ngIf="lastResult?.searchResults && lastResult!.searchResults!.length > 0">
          <span class="results-count">
            {{ 'VOICE.FOUND_RESULTS' | translate: { count: lastResult?.totalResults } }}
          </span>
        </div>
      </div>

      <!-- Close Button (when expanded) -->
      <button 
        *ngIf="isExpanded"
        class="close-btn"
        (click)="closeModal()"
        [attr.aria-label]="'COMMON.CLOSE' | translate">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>
  `,
  styles: [`
    .voice-search-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      padding: 16px;
    }

    .voice-btn {
      position: relative;
      width: 72px;
      height: 72px;
      border-radius: 50%;
      border: none;
      background: linear-gradient(135deg, #c8a97e 0%, #a0825a 100%);
      color: #1a1a1a;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;
      box-shadow: 0 4px 20px rgba(200, 169, 126, 0.3);
    }

    .voice-btn:hover:not(:disabled) {
      transform: scale(1.05);
      box-shadow: 0 6px 30px rgba(200, 169, 126, 0.4);
    }

    .voice-btn:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }

    .voice-btn.listening {
      background: linear-gradient(135deg, #ff6b6b 0%, #ee5a5a 100%);
      animation: pulse 1.5s infinite;
    }

    .voice-btn.processing {
      background: linear-gradient(135deg, #4ecdc4 0%, #44a8a0 100%);
    }

    .voice-btn.error {
      background: linear-gradient(135deg, #ff4757 0%, #ee3742 100%);
    }

    .voice-btn.fallback {
      background: linear-gradient(135deg, #ffa502 0%, #e69500 100%);
    }

    @keyframes pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.1); }
    }

    .voice-icon svg {
      width: 32px;
      height: 32px;
    }

    .voice-icon svg.spinning {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    .recording-waves {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      display: flex;
      gap: 3px;
      align-items: center;
      height: 20px;
    }

    .recording-waves span {
      width: 3px;
      background: white;
      border-radius: 2px;
      animation: wave 0.5s ease-in-out infinite;
    }

    .recording-waves span:nth-child(1) { height: 8px; animation-delay: 0s; }
    .recording-waves span:nth-child(2) { height: 16px; animation-delay: 0.1s; }
    .recording-waves span:nth-child(3) { height: 8px; animation-delay: 0.2s; }

    @keyframes wave {
      0%, 100% { transform: scaleY(1); }
      50% { transform: scaleY(1.5); }
    }

    .voice-status {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
    }

    .state-text {
      font-size: 14px;
      color: #c8a97e;
      font-weight: 500;
    }

    .fallback-badge {
      font-size: 11px;
      color: #ffa502;
      background: rgba(255, 165, 2, 0.1);
      padding: 2px 8px;
      border-radius: 12px;
    }

    .voice-preview {
      width: 100%;
      max-width: 400px;
      background: rgba(26, 26, 26, 0.8);
      border-radius: 12px;
      padding: 16px;
      border: 1px solid rgba(200, 169, 126, 0.2);
    }

    .transcript {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .transcript .label {
      font-size: 12px;
      color: #888;
    }

    .transcript .text {
      font-size: 16px;
      color: #e0e0e0;
      font-style: italic;
    }

    .error-message {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #ff6b6b;
    }

    .error-message .icon {
      font-size: 16px;
    }

    .error-message .text {
      font-size: 14px;
    }

    .intent-preview {
      margin-top: 12px;
      padding-top: 12px;
      border-top: 1px solid rgba(200, 169, 126, 0.1);
    }

    .intent-item {
      display: flex;
      gap: 8px;
      margin-bottom: 4px;
    }

    .intent-item .label {
      font-size: 12px;
      color: #888;
    }

    .intent-item .value {
      font-size: 13px;
      color: #c8a97e;
      font-weight: 500;
    }

    .intent-badges {
      display: flex;
      gap: 8px;
      margin-top: 8px;
    }

    .badge {
      font-size: 11px;
      padding: 4px 10px;
      border-radius: 12px;
      font-weight: 500;
    }

    .badge.open-now {
      background: rgba(78, 205, 196, 0.15);
      color: #4ecdc4;
    }

    .badge.radius {
      background: rgba(200, 169, 126, 0.15);
      color: #c8a97e;
    }

    .results-preview {
      margin-top: 12px;
      padding-top: 12px;
      border-top: 1px solid rgba(200, 169, 126, 0.1);
    }

    .results-count {
      font-size: 13px;
      color: #4ecdc4;
    }

    .close-btn {
      position: absolute;
      top: 16px;
      right: 16px;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      border: none;
      background: rgba(200, 169, 126, 0.1);
      color: #c8a97e;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
    }

    .close-btn:hover {
      background: rgba(200, 169, 126, 0.2);
    }

    .close-btn svg {
      width: 20px;
      height: 20px;
    }

    /* Expanded Mode */
    .voice-search-container.expanded {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.95);
      z-index: 10000;
      justify-content: center;
    }

    .voice-search-container.expanded .voice-btn {
      width: 120px;
      height: 120px;
    }

    .voice-search-container.expanded .voice-icon svg {
      width: 48px;
      height: 48px;
    }

    .voice-search-container.expanded .state-text {
      font-size: 18px;
    }

    /* Reduced Motion */
    @media (prefers-reduced-motion: reduce) {
      .voice-btn,
      .voice-icon svg.spinning,
      .recording-waves span {
        animation: none;
      }
    }
  `]
})
export class AIVoiceSearchComponent implements OnInit, OnDestroy {
  @Output() voiceResult = new EventEmitter<VoiceProcessResult>();
  @Output() transcriptChange = new EventEmitter<string>();
  @Input() showStateText = true;
  @Input() showPreview = true;
  @Input() isExpanded = false;
  @Input() autoSearch = true;

  state: VoiceAIState = 'idle';
  transcript = '';
  errorMessage = '';
  lastResult: VoiceProcessResult | null = null;
  usingFallback = false;
  userLocation: GeoLocation | null = null;

  private destroy$ = new Subject<void>();

  constructor(
    private voiceAIService: VoiceAIService,
    private voiceService: VoiceService,
    private geolocationService: GeolocationService,
    private ttsService: TtsService,
    private soundService: SoundService,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.getUserLocation();

    // Subscribe to voice AI state
    this.voiceAIService.voiceState$
      .pipe(takeUntil(this.destroy$))
      .subscribe(state => {
        this.state = state;
        this.handleStateChange(state);
      });

    // Subscribe to transcript
    this.voiceAIService.transcript$
      .pipe(takeUntil(this.destroy$))
      .subscribe(transcript => {
        this.transcript = transcript;
        this.transcriptChange.emit(transcript);
      });

    // Subscribe to results
    this.voiceAIService.result$
      .pipe(takeUntil(this.destroy$))
      .subscribe(result => {
        this.lastResult = result;
        if (result.success) {
          this.voiceResult.emit(result);
          this.announceResult(result);
        }
      });

    // Subscribe to errors
    this.voiceAIService.error$
      .pipe(takeUntil(this.destroy$))
      .subscribe(error => {
        this.errorMessage = error;
        this.ttsService.announceError(error);
      });

    // Subscribe to fallback mode
    this.voiceAIService.usingFallback$
      .pipe(takeUntil(this.destroy$))
      .subscribe(fallback => {
        this.usingFallback = fallback;
      });

    // Sync language
    this.translate.onLangChange
      .pipe(takeUntil(this.destroy$))
      .subscribe(event => {
        this.voiceService.setLanguage(event.lang);
        this.ttsService.setLanguage(event.lang);
      });

    const currentLang = this.translate.currentLang || 'en';
    this.voiceService.setLanguage(currentLang);
    this.ttsService.setLanguage(currentLang);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.voiceAIService.reset();
  }

  async getUserLocation(): Promise<void> {
    try {
      const location = await this.geolocationService.getCurrentPosition();
      this.userLocation = location;
      // Store location for interceptor
      localStorage.setItem('localink_location', JSON.stringify({
        lat: location.lat,
        lng: location.lng
      }));
    } catch (error) {
      console.warn('Geolocation error:', error);
    }
  }

  async toggleVoiceSearch(): Promise<void> {
    if (this.isRecording) {
      this.voiceAIService.stopRecording();
    } else {
      this.transcript = '';
      this.errorMessage = '';
      this.lastResult = null;
      await this.voiceAIService.startRecording();
    }
  }

  closeModal(): void {
    this.voiceAIService.reset();
    this.transcript = '';
    this.errorMessage = '';
    this.lastResult = null;
  }

  get isRecording(): boolean {
    return this.state === 'recording' || this.state === 'fallback';
  }

  get isProcessing(): boolean {
    return this.state === 'uploading' || this.state === 'processing';
  }

  get isError(): boolean {
    return this.state === 'error';
  }

  getStateText(): string {
    switch (this.state) {
      case 'recording':
        return 'VOICE.TAP_TO_STOP';
      case 'uploading':
        return 'VOICE.UPLOADING';
      case 'processing':
        return 'VOICE.PROCESSING_AI';
      case 'success':
        return 'VOICE.SUCCESS';
      case 'error':
        return 'VOICE.ERROR';
      case 'fallback':
        return 'VOICE.BROWSER_LISTENING';
      default:
        return 'VOICE.TAP_TO_SPEAK';
    }
  }

  getStateLabel(): string {
    return this.translate.instant(this.getStateText());
  }

  private handleStateChange(state: VoiceAIState): void {
    switch (state) {
      case 'recording':
        this.soundService.play('click');
        this.errorMessage = '';
        break;
      case 'processing':
        this.soundService.play('search');
        break;
      case 'success':
        this.soundService.play('success');
        break;
      case 'error':
        this.soundService.play('error');
        break;
    }
  }

  private announceResult(result: VoiceProcessResult): void {
    let isTtsEnabled = false;
    const subscription = this.ttsService.isEnabled$.subscribe(enabled => {
      isTtsEnabled = enabled;
    });
    subscription.unsubscribe();
    
    if (!isTtsEnabled) return;

    const langCode = this.translate.currentLang || 'en';
    
    let message = '';
    if (result.searchResults && result.searchResults.length > 0) {
      const count = result.totalResults || result.searchResults.length;
      message = this.translate.instant('VOICE.FOUND_N_RESULTS', { count });
    } else {
      message = this.translate.instant('VOICE.NO_RESULTS');
    }

    if (message) {
      this.ttsService.speak(message, 'normal');
    }
  }
}
