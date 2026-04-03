import { Component, OnInit, OnDestroy, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VoiceService, VoiceSearchResult, VoiceState } from '../../services/voice.service';
import { GeolocationService, GeoLocation } from '../../services/geolocation.service';
import { TtsService } from '../../services/tts.service';
import { SoundService } from '../../services/sound.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { UniversalAccessibilitySoundDirective } from '../../directives/universal-accessibility-sound.directive';

@Component({
  selector: 'app-voice-search',
  standalone: true,
  imports: [CommonModule, TranslateModule, UniversalAccessibilitySoundDirective],
  templateUrl: './voice-search.component.html',
  styleUrls: ['./voice-search.component.css']
})
export class VoiceSearchComponent implements OnInit, OnDestroy {
  @Output() voiceSearchResult = new EventEmitter<VoiceSearchResult & { userLocation?: GeoLocation }>();
  @Output() transcriptChange = new EventEmitter<string>();
  @Input() showStateText = true;
  @Input() showPreview = true;
  @Input() isExpanded = false;

  state: VoiceState = 'idle';
  transcript = '';
  errorMessage = '';
  parsedResult: VoiceSearchResult | null = null;
  showSettings = false;
  ttsEnabled = true;
  soundEnabled = true;
  locationStatus = '';
  userLocation: GeoLocation | null = null;
  isLoadingLocation = false;

  private destroy$ = new Subject<void>();

  constructor(
    private voiceService: VoiceService,
    private geolocationService: GeolocationService,
    private ttsService: TtsService,
    private soundService: SoundService,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.getUserLocation();

    this.voiceService.voiceState$
      .pipe(takeUntil(this.destroy$))
      .subscribe(state => {
        this.state = state;
        switch (state) {
          case 'listening':
            this.soundService.play('click');
            break;
          case 'processing':
            this.soundService.play('search');
            break;
          case 'error':
            this.soundService.play('error');
            break;
        }
      });

    this.voiceService.transcript$
      .pipe(takeUntil(this.destroy$))
      .subscribe(transcript => {
        this.transcript = transcript;
        this.errorMessage = '';
        this.parsedResult = this.voiceService.parseVoiceCommand(transcript);
        this.transcriptChange.emit(transcript);

        if (this.parsedResult) {
          const resultWithLocation = {
            ...this.parsedResult,
            userLocation: this.userLocation || undefined
          };
          this.voiceSearchResult.emit(resultWithLocation);

          if (this.parsedResult.query) {
            const langCode = this.translate.currentLang || 'en';
            const messages: { [key: string]: string } = {
              'en': `Searching for ${this.parsedResult.query}`,
              'hi': `${this.parsedResult.query} खोज रहे हैं`,
              'ta': `${this.parsedResult.query} தேடுகிறது`,
              'te': `${this.parsedResult.query} కోసం శోధిస్తోంది`
            };
            this.ttsService.speak(messages[langCode] || messages['en'], 'normal');
          }
        }

        setTimeout(() => {
          this.voiceService.reset();
          this.state = 'idle';
        }, 2000);
      });

    this.voiceService.error$
      .pipe(takeUntil(this.destroy$))
      .subscribe(error => {
        this.errorMessage = error;
        this.transcript = '';
        this.ttsService.announceError(error);
        setTimeout(() => {
          this.errorMessage = '';
          this.voiceService.reset();
        }, 3000);
      });

    this.ttsService.isEnabled$
      .pipe(takeUntil(this.destroy$))
      .subscribe(enabled => {
        this.ttsEnabled = enabled;
      });

    this.soundService.config$
      .pipe(takeUntil(this.destroy$))
      .subscribe(config => {
        this.soundEnabled = config.enabled;
      });

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
    this.voiceService.stopListening();
  }

  async getUserLocation(): Promise<void> {
    this.isLoadingLocation = true;
    this.locationStatus = 'Getting location...';

    try {
      const location = await this.geolocationService.getCurrentPosition();
      this.userLocation = location;
      this.locationStatus = `📍 ${location.city || this.translate.instant('VOICE.LOCATION_FOUND')} (${location.accuracy?.toFixed(0) || '?'}` + this.translate.instant('VOICE.M_ACCURACY') + `)`;
    } catch (error) {
      this.locationStatus = this.translate.instant('VOICE.LOCATION_UNAVAILABLE');
      console.warn('Geolocation error:', error);
    } finally {
      this.isLoadingLocation = false;
    }
  }

  async toggleVoiceSearch(): Promise<void> {
    if (this.state === 'listening') {
      this.voiceService.stopListening();
    } else {
      const permission = await this.voiceService.checkMicrophonePermission();

      if (permission === 'denied') {
        this.errorMessage = this.translate.instant('VOICE.MIC_DENIED');
        this.soundService.play('error');
        return;
      }

      if (permission === 'prompt') {
        const granted = await this.voiceService.requestMicrophonePermission();
        if (!granted) {
          this.errorMessage = this.translate.instant('VOICE.MIC_REQUIRED');
          this.soundService.play('error');
          return;
        }
      }

      this.transcript = '';
      this.errorMessage = '';
      this.parsedResult = null;
      this.voiceService.startListening();
    }
  }

  closeModal(): void {
    this.voiceService.stopListening();
    this.transcript = '';
    this.errorMessage = '';
    this.parsedResult = null;
    this.state = 'idle';
  }

  retryVoiceSearch(): void {
    this.transcript = '';
    this.errorMessage = '';
    this.parsedResult = null;
    this.voiceService.startListening();
  }

  startVoiceSearch(): void {
    this.transcript = '';
    this.errorMessage = '';
    this.parsedResult = null;
    this.voiceService.startListening();
  }

  getStateText(): string {
    switch (this.state) {
      case 'listening':
        return 'VOICE.LISTENING';
      case 'processing':
        return 'VOICE.PROCESSING';
      case 'error':
        return 'VOICE.ERROR';
      default:
        return 'VOICE.TAP_TO_SPEAK';
    }
  }

  getStateLabel(): string {
    switch (this.state) {
      case 'listening':
        return this.translate.instant('VOICE.LISTENING');
      case 'processing':
        return this.translate.instant('VOICE.PROCESSING');
      case 'error':
        return this.translate.instant('VOICE.ERROR');
      default:
        return this.translate.instant('VOICE.READY');
    }
  }

  toggleTts(): void {
    this.ttsService.toggle();
    this.soundService.play('click');
  }

  toggleSound(): void {
    this.soundService.toggle();
  }

  toggleSettings(): void {
    this.showSettings = !this.showSettings;
    this.soundService.play('click');
  }
}
