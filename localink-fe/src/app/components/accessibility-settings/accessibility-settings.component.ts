import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AccessibilitySettingsService, AccessibilitySettings } from '../../services/accessibility-settings.service';
import { TtsService } from '../../services/tts.service';
import { SoundService } from '../../services/sound.service';
import { VoiceNavigationService } from '../../services/voice-navigation.service';
import { GestureNavigationService } from '../../services/gesture-navigation.service';
import { SpeakOnInteractionDirective } from '../../directives/speak-on-interaction.directive';
import { UniversalAccessibilitySoundDirective } from '../../directives/universal-accessibility-sound.directive';

/**
 * AccessibilitySettingsComponent
 *
 * UI component for managing accessibility preferences.
 * Allows users to toggle voice guidance, voice navigation,
 * gesture navigation, and sound feedback.
 */
@Component({
  selector: 'app-accessibility-settings',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    SpeakOnInteractionDirective,
    UniversalAccessibilitySoundDirective
  ],
  template: `
    <div class="accessibility-settings" role="region" aria-label="{{ 'ACCESSIBILITY.SETTINGS_TITLE' | translate }}">
      <!-- Header -->
      <div class="settings-header">
        <h2 id="accessibility-title"
            appSpeakOnInteraction
            [speakTextKey]="'ACCESSIBILITY.SETTINGS_TITLE'"
            speakPriority="high">
          {{ 'ACCESSIBILITY.SETTINGS_TITLE' | translate }}
        </h2>
        <p class="settings-description">
          {{ 'ACCESSIBILITY.SETTINGS_DESCRIPTION' | translate }}
        </p>
      </div>

      <!-- Main Toggles Section -->
      <div class="settings-section" role="group" aria-labelledby="main-features-title">
        <h3 id="main-features-title" class="section-title">
          {{ 'ACCESSIBILITY.MAIN_FEATURES' | translate }}
        </h3>

        <!-- Voice Guidance Toggle -->
        <div class="setting-item"
             appSpeakOnInteraction
             [speakTextKey]="'ACCESSIBILITY.VOICE_GUIDANCE_LABEL'"
             [speakContext]="'ACCESSIBILITY.VOICE_GUIDANCE_DESC'">
          <div class="setting-info">
            <label class="setting-label" for="voice-guidance-toggle">
              {{ 'ACCESSIBILITY.VOICE_GUIDANCE_LABEL' | translate }}
            </label>
            <span class="setting-description">
              {{ 'ACCESSIBILITY.VOICE_GUIDANCE_DESC' | translate }}
            </span>
          </div>
          <label class="toggle-switch">
            <input
              type="checkbox"
              id="voice-guidance-toggle"
              [(ngModel)]="settings.voiceGuidance"
              (change)="onVoiceGuidanceToggle()"
              attr.aria-label="{{ 'ACCESSIBILITY.VOICE_GUIDANCE_LABEL' | translate }}"
            />
            <span class="toggle-slider" aria-hidden="true"></span>
          </label>
        </div>

        <!-- Voice Navigation Toggle -->
        <div class="setting-item"
             appSpeakOnInteraction
             [speakTextKey]="'ACCESSIBILITY.VOICE_NAV_LABEL'"
             [speakContext]="'ACCESSIBILITY.VOICE_NAV_DESC'">
          <div class="setting-info">
            <label class="setting-label" for="voice-nav-toggle">
              {{ 'ACCESSIBILITY.VOICE_NAV_LABEL' | translate }}
            </label>
            <span class="setting-description">
              {{ 'ACCESSIBILITY.VOICE_NAV_DESC' | translate }}
            </span>
            <span class="setting-hint" *ngIf="!browserSupport.speechRecognition">
              {{ 'ACCESSIBILITY.NOT_SUPPORTED' | translate }}
            </span>
          </div>
          <label class="toggle-switch">
            <input
              type="checkbox"
              id="voice-nav-toggle"
              [(ngModel)]="settings.voiceNavigation"
              (change)="onVoiceNavToggle()"
              [disabled]="!browserSupport.speechRecognition"
              attr.aria-label="{{ 'ACCESSIBILITY.VOICE_NAV_LABEL' | translate }}"
            />
            <span class="toggle-slider" aria-hidden="true"></span>
          </label>
        </div>

        <!-- Gesture Navigation Toggle -->
        <div class="setting-item"
             appSpeakOnInteraction
             [speakTextKey]="'ACCESSIBILITY.GESTURE_NAV_LABEL'"
             [speakContext]="'ACCESSIBILITY.GESTURE_NAV_DESC'">
          <div class="setting-info">
            <label class="setting-label" for="gesture-nav-toggle">
              {{ 'ACCESSIBILITY.GESTURE_NAV_LABEL' | translate }}
            </label>
            <span class="setting-description">
              {{ 'ACCESSIBILITY.GESTURE_NAV_DESC' | translate }}
            </span>
          </div>
          <label class="toggle-switch">
            <input
              type="checkbox"
              id="gesture-nav-toggle"
              [(ngModel)]="settings.gestureNavigation"
              (change)="onGestureNavToggle()"
              attr.aria-label="{{ 'ACCESSIBILITY.GESTURE_NAV_LABEL' | translate }}"
            />
            <span class="toggle-slider" aria-hidden="true"></span>
          </label>
        </div>

        <!-- Sound Feedback Toggle -->
        <div class="setting-item"
             appSpeakOnInteraction
             [speakTextKey]="'ACCESSIBILITY.SOUND_FEEDBACK_LABEL'"
             [speakContext]="'ACCESSIBILITY.SOUND_FEEDBACK_DESC'">
          <div class="setting-info">
            <label class="setting-label" for="sound-feedback-toggle">
              {{ 'ACCESSIBILITY.SOUND_FEEDBACK_LABEL' | translate }}
            </label>
            <span class="setting-description">
              {{ 'ACCESSIBILITY.SOUND_FEEDBACK_DESC' | translate }}
            </span>
          </div>
          <label class="toggle-switch">
            <input
              type="checkbox"
              id="sound-feedback-toggle"
              [(ngModel)]="settings.soundFeedback"
              (change)="onSoundFeedbackToggle()"
              attr.aria-label="{{ 'ACCESSIBILITY.SOUND_FEEDBACK_LABEL' | translate }}"
            />
            <span class="toggle-slider" aria-hidden="true"></span>
          </label>
        </div>
      </div>

      <!-- TTS Customization Section -->
      <div class="settings-section" role="group" aria-labelledby="tts-customization-title" *ngIf="settings.voiceGuidance">
        <h3 id="tts-customization-title" class="section-title">
          {{ 'ACCESSIBILITY.TTS_CUSTOMIZATION' | translate }}
        </h3>

        <!-- Speech Rate -->
        <div class="setting-item slider-setting"
             appSpeakOnInteraction
             [speakTextKey]="'ACCESSIBILITY.SPEECH_RATE_LABEL'">
          <div class="setting-info">
            <label class="setting-label" for="speech-rate">
              {{ 'ACCESSIBILITY.SPEECH_RATE_LABEL' | translate }}
            </label>
            <span class="setting-value">{{ settings.speechRate }}x</span>
          </div>
          <input
            type="range"
            id="speech-rate"
            min="0.5"
            max="2"
            step="0.1"
            [(ngModel)]="settings.speechRate"
            (change)="onSpeechRateChange()"
            attr.aria-label="{{ 'ACCESSIBILITY.SPEECH_RATE_LABEL' | translate }}"
          />
          <div class="slider-labels">
            <span>{{ 'ACCESSIBILITY.SLOW' | translate }}</span>
            <span>{{ 'ACCESSIBILITY.NORMAL' | translate }}</span>
            <span>{{ 'ACCESSIBILITY.FAST' | translate }}</span>
          </div>
        </div>

        <!-- Speech Volume -->
        <div class="setting-item slider-setting"
             appSpeakOnInteraction
             [speakTextKey]="'ACCESSIBILITY.SPEECH_VOLUME_LABEL'">
          <div class="setting-info">
            <label class="setting-label" for="speech-volume">
              {{ 'ACCESSIBILITY.SPEECH_VOLUME_LABEL' | translate }}
            </label>
            <span class="setting-value">{{ settings.speechVolume * 100 | number:'1.0-0' }}%</span>
          </div>
          <input
            type="range"
            id="speech-volume"
            min="0"
            max="1"
            step="0.1"
            [(ngModel)]="settings.speechVolume"
            (change)="onSpeechVolumeChange()"
            attr.aria-label="{{ 'ACCESSIBILITY.SPEECH_VOLUME_LABEL' | translate }}"
          />
        </div>

        <!-- Test Speech Button -->
        <button
          class="test-speech-btn"
          (click)="testSpeech()"
          appAccessibilitySound
          appSpeakOnInteraction
          [speakTextKey]="'ACCESSIBILITY.TEST_SPEECH'">
          {{ 'ACCESSIBILITY.TEST_SPEECH' | translate }}
        </button>
      </div>

      <!-- Browser Support Info -->
      <div class="settings-section support-info" role="region" aria-labelledby="support-info-title">
        <h3 id="support-info-title" class="section-title">
          {{ 'ACCESSIBILITY.BROWSER_SUPPORT' | translate }}
        </h3>
        <ul class="support-list">
          <li [class.supported]="browserSupport.speechSynthesis">
            <span class="support-icon">{{ browserSupport.speechSynthesis ? '✓' : '✗' }}</span>
            {{ 'ACCESSIBILITY.SUPPORT_SPEECH_SYNTHESIS' | translate }}
          </li>
          <li [class.supported]="browserSupport.speechRecognition">
            <span class="support-icon">{{ browserSupport.speechRecognition ? '✓' : '✗' }}</span>
            {{ 'ACCESSIBILITY.SUPPORT_SPEECH_RECOGNITION' | translate }}
          </li>
          <li [class.supported]="browserSupport.touchEvents">
            <span class="support-icon">{{ browserSupport.touchEvents ? '✓' : '✗' }}</span>
            {{ 'ACCESSIBILITY.SUPPORT_TOUCH' | translate }}
          </li>
        </ul>
      </div>

      <!-- Reset Button -->
      <div class="settings-footer">
        <button
          class="reset-btn"
          (click)="resetSettings()"
          appAccessibilitySound
          appSpeakOnInteraction
          [speakTextKey]="'ACCESSIBILITY.RESET_DEFAULTS'">
          {{ 'ACCESSIBILITY.RESET_DEFAULTS' | translate }}
        </button>
      </div>
    </div>
  `,
  styles: [`
    .accessibility-settings {
      padding: 24px;
      max-width: 600px;
      margin: 0 auto;
      background: #ffffff;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .settings-header {
      margin-bottom: 24px;
      padding-bottom: 16px;
      border-bottom: 2px solid #e0e0e0;
    }

    .settings-header h2 {
      margin: 0 0 8px 0;
      font-size: 24px;
      font-weight: 600;
      color: #1a1a1a;
    }

    .settings-description {
      margin: 0;
      color: #666;
      font-size: 14px;
    }

    .settings-section {
      margin-bottom: 24px;
    }

    .section-title {
      font-size: 16px;
      font-weight: 600;
      color: #333;
      margin: 0 0 16px 0;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .setting-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px;
      background: #f8f9fa;
      border-radius: 8px;
      margin-bottom: 12px;
      transition: background-color 0.2s ease;
    }

    .setting-item:hover {
      background: #e9ecef;
    }

    .setting-item:focus-within {
      outline: 2px solid #0066cc;
      outline-offset: 2px;
    }

    .setting-info {
      flex: 1;
      margin-right: 16px;
    }

    .setting-label {
      display: block;
      font-weight: 500;
      color: #1a1a1a;
      margin-bottom: 4px;
      cursor: pointer;
    }

    .setting-description {
      display: block;
      font-size: 13px;
      color: #666;
    }

    .setting-hint {
      display: block;
      font-size: 12px;
      color: #dc3545;
      margin-top: 4px;
    }

    /* Toggle Switch */
    .toggle-switch {
      position: relative;
      display: inline-block;
      width: 52px;
      height: 28px;
      flex-shrink: 0;
    }

    .toggle-switch input {
      opacity: 0;
      width: 0;
      height: 0;
    }

    .toggle-slider {
      position: absolute;
      cursor: pointer;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: #ccc;
      transition: 0.3s;
      border-radius: 28px;
    }

    .toggle-slider:before {
      position: absolute;
      content: "";
      height: 20px;
      width: 20px;
      left: 4px;
      bottom: 4px;
      background-color: white;
      transition: 0.3s;
      border-radius: 50%;
    }

    .toggle-switch input:checked + .toggle-slider {
      background-color: #28a745;
    }

    .toggle-switch input:focus + .toggle-slider {
      box-shadow: 0 0 0 3px rgba(40, 167, 69, 0.3);
    }

    .toggle-switch input:checked + .toggle-slider:before {
      transform: translateX(24px);
    }

    .toggle-switch input:disabled + .toggle-slider {
      background-color: #e9ecef;
      cursor: not-allowed;
    }

    /* Slider Settings */
    .slider-setting {
      flex-direction: column;
      align-items: stretch;
    }

    .slider-setting .setting-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
      margin-right: 0;
    }

    .slider-setting input[type="range"] {
      width: 100%;
      height: 6px;
      border-radius: 3px;
      background: #ddd;
      outline: none;
      cursor: pointer;
    }

    .slider-setting input[type="range"]::-webkit-slider-thumb {
      appearance: none;
      width: 18px;
      height: 18px;
      border-radius: 50%;
      background: #28a745;
      cursor: pointer;
    }

    .slider-setting input[type="range"]::-moz-range-thumb {
      width: 18px;
      height: 18px;
      border-radius: 50%;
      background: #28a745;
      cursor: pointer;
      border: none;
    }

    .slider-labels {
      display: flex;
      justify-content: space-between;
      margin-top: 8px;
      font-size: 12px;
      color: #666;
    }

    /* Buttons */
    .test-speech-btn,
    .reset-btn {
      padding: 12px 24px;
      border: none;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .test-speech-btn {
      background: #0066cc;
      color: white;
      width: 100%;
      margin-top: 16px;
    }

    .test-speech-btn:hover {
      background: #0052a3;
    }

    .reset-btn {
      background: transparent;
      color: #dc3545;
      border: 2px solid #dc3545;
      width: 100%;
    }

    .reset-btn:hover {
      background: #dc3545;
      color: white;
    }

    /* Support Info */
    .support-info {
      background: #f8f9fa;
      padding: 16px;
      border-radius: 8px;
    }

    .support-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .support-list li {
      display: flex;
      align-items: center;
      padding: 8px 0;
      color: #666;
    }

    .support-list li.supported {
      color: #28a745;
    }

    .support-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      margin-right: 12px;
      font-weight: bold;
    }

    .support-list li.supported .support-icon {
      color: #28a745;
    }

    /* Responsive */
    @media (max-width: 480px) {
      .accessibility-settings {
        padding: 16px;
      }

      .setting-item {
        flex-direction: column;
        align-items: flex-start;
      }

      .setting-info {
        margin-right: 0;
        margin-bottom: 12px;
      }

      .toggle-switch {
        align-self: flex-end;
      }
    }

    /* High contrast mode support */
    @media (prefers-contrast: high) {
      .setting-item {
        border: 2px solid currentColor;
      }

      .toggle-switch input:focus + .toggle-slider {
        outline: 3px solid currentColor;
        outline-offset: 2px;
      }
    }

    /* Reduced motion support */
    @media (prefers-reduced-motion: reduce) {
      .toggle-slider,
      .toggle-slider:before,
      .setting-item,
      .test-speech-btn,
      .reset-btn {
        transition: none;
      }
    }
  `]
})
export class AccessibilitySettingsComponent implements OnInit, OnDestroy {
  settings: AccessibilitySettings;
  browserSupport = {
    speechSynthesis: false,
    speechRecognition: false,
    touchEvents: false
  };

  private destroy$ = new Subject<void>();

  constructor(
    private settingsService: AccessibilitySettingsService,
    private ttsService: TtsService,
    private soundService: SoundService,
    private voiceNavService: VoiceNavigationService,
    private gestureNavService: GestureNavigationService,
    private translate: TranslateService
  ) {
    this.settings = this.settingsService.getSettings();
  }

  ngOnInit(): void {
    // Subscribe to settings changes
    this.settingsService.settings$
      .pipe(takeUntil(this.destroy$))
      .subscribe(settings => {
        this.settings = settings;
      });

    // Check browser support
    this.browserSupport = this.settingsService.checkBrowserSupport();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onVoiceGuidanceToggle(): void {
    this.settingsService.setVoiceGuidance(this.settings.voiceGuidance);

    if (this.settings.voiceGuidance) {
      const message = this.translate.instant('ACCESSIBILITY.VOICE_ENABLED');
      this.ttsService.speak(message, 'high');
    } else {
      this.ttsService.stop();
    }

    this.soundService.play('click');
  }

  onVoiceNavToggle(): void {
    this.settingsService.setVoiceNavigation(this.settings.voiceNavigation);

    if (this.settings.voiceNavigation) {
      const message = this.translate.instant('ACCESSIBILITY.VOICE_NAV_ENABLED');
      this.ttsService.speak(message, 'normal');
    }

    this.soundService.play('click');
  }

  onGestureNavToggle(): void {
    this.settingsService.setGestureNavigation(this.settings.gestureNavigation);

    if (this.settings.gestureNavigation) {
      this.gestureNavService.enable();
      const message = this.translate.instant('ACCESSIBILITY.GESTURES_ENABLED');
      this.ttsService.speak(message, 'normal');
    } else {
      this.gestureNavService.disable();
    }

    this.soundService.play('click');
  }

  onSoundFeedbackToggle(): void {
    this.settingsService.setSoundFeedback(this.settings.soundFeedback);

    // Play sound to confirm toggle
    if (this.settings.soundFeedback) {
      setTimeout(() => this.soundService.play('success'), 100);
    }

    const message = this.translate.instant(
      this.settings.soundFeedback ? 'ACCESSIBILITY.SOUND_ENABLED' : 'ACCESSIBILITY.SOUND_DISABLED'
    );
    this.ttsService.speak(message, 'normal');
  }

  onSpeechRateChange(): void {
    this.settingsService.setSpeechRate(this.settings.speechRate);

    // Speak test message with new rate
    const message = this.translate.instant('ACCESSIBILITY.SPEECH_RATE_CHANGED', {
      rate: this.settings.speechRate
    });
    this.ttsService.speak(message, 'normal');
  }

  onSpeechVolumeChange(): void {
    this.settingsService.setSpeechVolume(this.settings.speechVolume);

    // Speak test message with new volume
    const message = this.translate.instant('ACCESSIBILITY.SPEECH_VOLUME_CHANGED', {
      volume: Math.round(this.settings.speechVolume * 100)
    });
    this.ttsService.speak(message, 'normal');
  }

  testSpeech(): void {
    const testMessage = this.translate.instant('ACCESSIBILITY.TEST_MESSAGE');
    this.ttsService.speak(testMessage, 'high');
    this.soundService.play('click');
  }

  resetSettings(): void {
    this.settingsService.resetSettings();
    this.gestureNavService.disable();

    const message = this.translate.instant('ACCESSIBILITY.SETTINGS_RESET');
    this.ttsService.speak(message, 'normal');
    this.soundService.play('success');
  }
}
