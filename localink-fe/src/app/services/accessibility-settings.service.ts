import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

/**
 * Accessibility Settings Interface
 * Stores all user preferences for accessibility features
 */
export interface AccessibilitySettings {
  /** Enable/disable voice guidance (text-to-speech) */
  voiceGuidance: boolean;
  /** Enable/disable voice navigation (speech commands) */
  voiceNavigation: boolean;
  /** Enable/disable gesture navigation */
  gestureNavigation: boolean;
  /** Enable/disable sound feedback */
  soundFeedback: boolean;
  /** TTS speech rate (0.5 - 2.0) */
  speechRate: number;
  /** TTS speech pitch (0.5 - 2.0) */
  speechPitch: number;
  /** TTS speech volume (0 - 1) */
  speechVolume: number;
}

/**
 * Default accessibility settings
 */
export const DEFAULT_ACCESSIBILITY_SETTINGS: AccessibilitySettings = {
  voiceGuidance: false,
  voiceNavigation: false,
  gestureNavigation: false,
  soundFeedback: true,
  speechRate: 1.0,
  speechPitch: 1.0,
  speechVolume: 0.8
};

/**
 * Storage key for localStorage
 */
const STORAGE_KEY = 'localink_accessibility_settings';

/**
 * AccessibilitySettingsService
 *
 * Unified service to manage all accessibility preferences.
 * Persists settings to localStorage and provides reactive state.
 *
 * Features:
 * - Voice guidance ON/OFF
 * - Voice navigation ON/OFF
 * - Gesture navigation ON/OFF
 * - Sound feedback ON/OFF
 * - TTS customization (rate, pitch, volume)
 * - Reactive state via BehaviorSubjects
 * - Automatic localStorage persistence
 */
@Injectable({
  providedIn: 'root'
})
export class AccessibilitySettingsService {
  private settingsSubject: BehaviorSubject<AccessibilitySettings>;
  public settings$: Observable<AccessibilitySettings>;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    const initialSettings = this.loadSettings();
    this.settingsSubject = new BehaviorSubject<AccessibilitySettings>(initialSettings);
    this.settings$ = this.settingsSubject.asObservable();
  }

  /**
   * Load settings from localStorage or return defaults
   */
  private loadSettings(): AccessibilitySettings {
    if (!isPlatformBrowser(this.platformId)) {
      return DEFAULT_ACCESSIBILITY_SETTINGS;
    }

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...DEFAULT_ACCESSIBILITY_SETTINGS, ...parsed };
      }
    } catch (error) {
      console.warn('[AccessibilitySettings] Failed to load settings:', error);
    }

    return DEFAULT_ACCESSIBILITY_SETTINGS;
  }

  /**
   * Save current settings to localStorage
   */
  private saveSettings(settings: AccessibilitySettings): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
      console.warn('[AccessibilitySettings] Failed to save settings:', error);
    }
  }

  /**
   * Get current settings snapshot
   */
  getSettings(): AccessibilitySettings {
    return this.settingsSubject.value;
  }

  /**
   * Update all settings at once
   */
  updateSettings(settings: Partial<AccessibilitySettings>): void {
    const current = this.settingsSubject.value;
    const updated = { ...current, ...settings };
    this.settingsSubject.next(updated);
    this.saveSettings(updated);
  }

  /**
   * Reset settings to defaults
   */
  resetSettings(): void {
    this.settingsSubject.next(DEFAULT_ACCESSIBILITY_SETTINGS);
    this.saveSettings(DEFAULT_ACCESSIBILITY_SETTINGS);
  }

  // ====================
  // Individual Toggles
  // ====================

  /**
   * Toggle voice guidance (text-to-speech)
   */
  toggleVoiceGuidance(): void {
    const current = this.settingsSubject.value;
    this.updateSettings({ voiceGuidance: !current.voiceGuidance });
  }

  /**
   * Set voice guidance state
   */
  setVoiceGuidance(enabled: boolean): void {
    this.updateSettings({ voiceGuidance: enabled });
  }

  /**
   * Check if voice guidance is enabled
   */
  isVoiceGuidanceEnabled(): boolean {
    return this.settingsSubject.value.voiceGuidance;
  }

  /**
   * Toggle voice navigation (speech commands)
   */
  toggleVoiceNavigation(): void {
    const current = this.settingsSubject.value;
    this.updateSettings({ voiceNavigation: !current.voiceNavigation });
  }

  /**
   * Set voice navigation state
   */
  setVoiceNavigation(enabled: boolean): void {
    this.updateSettings({ voiceNavigation: enabled });
  }

  /**
   * Check if voice navigation is enabled
   */
  isVoiceNavigationEnabled(): boolean {
    return this.settingsSubject.value.voiceNavigation;
  }

  /**
   * Toggle gesture navigation
   */
  toggleGestureNavigation(): void {
    const current = this.settingsSubject.value;
    this.updateSettings({ gestureNavigation: !current.gestureNavigation });
  }

  /**
   * Set gesture navigation state
   */
  setGestureNavigation(enabled: boolean): void {
    this.updateSettings({ gestureNavigation: enabled });
  }

  /**
   * Check if gesture navigation is enabled
   */
  isGestureNavigationEnabled(): boolean {
    return this.settingsSubject.value.gestureNavigation;
  }

  /**
   * Toggle sound feedback
   */
  toggleSoundFeedback(): void {
    const current = this.settingsSubject.value;
    this.updateSettings({ soundFeedback: !current.soundFeedback });
  }

  /**
   * Set sound feedback state
   */
  setSoundFeedback(enabled: boolean): void {
    this.updateSettings({ soundFeedback: enabled });
  }

  /**
   * Check if sound feedback is enabled
   */
  isSoundFeedbackEnabled(): boolean {
    return this.settingsSubject.value.soundFeedback;
  }

  // ====================
  // TTS Customization
  // ====================

  /**
   * Set TTS speech rate
   * @param rate Value between 0.5 and 2.0
   */
  setSpeechRate(rate: number): void {
    const clamped = Math.max(0.5, Math.min(2.0, rate));
    this.updateSettings({ speechRate: clamped });
  }

  /**
   * Get TTS speech rate
   */
  getSpeechRate(): number {
    return this.settingsSubject.value.speechRate;
  }

  /**
   * Set TTS speech pitch
   * @param pitch Value between 0.5 and 2.0
   */
  setSpeechPitch(pitch: number): void {
    const clamped = Math.max(0.5, Math.min(2.0, pitch));
    this.updateSettings({ speechPitch: clamped });
  }

  /**
   * Get TTS speech pitch
   */
  getSpeechPitch(): number {
    return this.settingsSubject.value.speechPitch;
  }

  /**
   * Set TTS speech volume
   * @param volume Value between 0 and 1
   */
  setSpeechVolume(volume: number): void {
    const clamped = Math.max(0, Math.min(1, volume));
    this.updateSettings({ speechVolume: clamped });
  }

  /**
   * Get TTS speech volume
   */
  getSpeechVolume(): number {
    return this.settingsSubject.value.speechVolume;
  }

  // ====================
  // Utility Methods
  // ====================

  /**
   * Check if any accessibility feature is enabled
   */
  hasAnyEnabled(): boolean {
    const s = this.settingsSubject.value;
    return s.voiceGuidance || s.voiceNavigation || s.gestureNavigation || s.soundFeedback;
  }

  /**
   * Check if browser supports required APIs
   */
  checkBrowserSupport(): {
    speechSynthesis: boolean;
    speechRecognition: boolean;
    touchEvents: boolean;
  } {
    if (!isPlatformBrowser(this.platformId)) {
      return { speechSynthesis: false, speechRecognition: false, touchEvents: false };
    }

    return {
      speechSynthesis: 'speechSynthesis' in window,
      speechRecognition: 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window,
      touchEvents: 'ontouchstart' in window || navigator.maxTouchPoints > 0
    };
  }

  /**
   * Export settings for backup
   */
  exportSettings(): string {
    return JSON.stringify(this.settingsSubject.value, null, 2);
  }

  /**
   * Import settings from backup
   */
  importSettings(json: string): boolean {
    try {
      const parsed = JSON.parse(json);
      const validSettings: Partial<AccessibilitySettings> = {};

      // Validate each property
      if (typeof parsed.voiceGuidance === 'boolean') validSettings.voiceGuidance = parsed.voiceGuidance;
      if (typeof parsed.voiceNavigation === 'boolean') validSettings.voiceNavigation = parsed.voiceNavigation;
      if (typeof parsed.gestureNavigation === 'boolean') validSettings.gestureNavigation = parsed.gestureNavigation;
      if (typeof parsed.soundFeedback === 'boolean') validSettings.soundFeedback = parsed.soundFeedback;
      if (typeof parsed.speechRate === 'number') validSettings.speechRate = Math.max(0.5, Math.min(2.0, parsed.speechRate));
      if (typeof parsed.speechPitch === 'number') validSettings.speechPitch = Math.max(0.5, Math.min(2.0, parsed.speechPitch));
      if (typeof parsed.speechVolume === 'number') validSettings.speechVolume = Math.max(0, Math.min(1, parsed.speechVolume));

      this.updateSettings(validSettings);
      return true;
    } catch (error) {
      console.warn('[AccessibilitySettings] Failed to import settings:', error);
      return false;
    }
  }
}
