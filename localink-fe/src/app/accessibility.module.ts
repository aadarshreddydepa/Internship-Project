import { NgModule, APP_INITIALIZER, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { AccessibilitySettingsService } from './services/accessibility-settings.service';
import { TtsService } from './services/tts.service';
import { VoiceService } from './services/voice.service';
import { VoiceNavigationService } from './services/voice-navigation.service';
import { GestureNavigationService } from './services/gesture-navigation.service';
import { SoundService } from './services/sound.service';
import { GlobalAccessibilitySoundService } from './services/global-accessibility-sound.service';
import { AccessibilitySettingsComponent } from './components/accessibility-settings/accessibility-settings.component';
import { SpeakOnInteractionDirective } from './directives/speak-on-interaction.directive';
import { AccessibilitySoundDirective } from './directives/accessibility-sound.directive';
import { UniversalAccessibilitySoundDirective } from './directives/universal-accessibility-sound.directive';
import { TranslateService } from '@ngx-translate/core';

/**
 * Accessibility Initialization Factory
 * Initializes accessibility services on app startup
 */
export function initializeAccessibility(
  settingsService: AccessibilitySettingsService,
  gestureNavService: GestureNavigationService,
  globalSoundService: GlobalAccessibilitySoundService,
  translate: TranslateService,
  platformId: Object
): () => void {
  return () => {
    if (!isPlatformBrowser(platformId)) {
      return;
    }

    const settings = settingsService.getSettings();

    // Enable gesture navigation if enabled in settings
    if (settings.gestureNavigation) {
      gestureNavService.enable();
    }

    // Global sound service is automatically initialized
    // TTS service is automatically initialized

    // Subscribe to language changes to sync with TTS
    translate.onLangChange.subscribe(event => {
      // Language changes are handled by the translate service
    });
  };
}

/**
 * AccessibilityModule
 *
 * Central module for all accessibility features in the Localink application.
 * Provides voice guidance, voice navigation, gesture navigation, and sound feedback.
 *
 * Features:
 * - Voice Guidance (Text-to-Speech): Speaks UI elements on hover/focus/touch
 * - Voice Navigation: Control app using voice commands
 * - Gesture Navigation: Swipe, tap, and keyboard navigation
 * - Sound Feedback: Audio cues for interactions
 *
 * Usage:
 * Import this module in your root AppModule or use standalone imports.
 *
 * For standalone components:
 * ```typescript
 * import { SpeakOnInteractionDirective } from './directives/speak-on-interaction.directive';
 * import { AccessibilitySettingsComponent } from './components/accessibility-settings/accessibility-settings.component';
 *
 * @Component({
 *   imports: [SpeakOnInteractionDirective, AccessibilitySettingsComponent]
 * })
 * ```
 */
@NgModule({
  imports: [
    CommonModule,
    // Standalone components and directives
    AccessibilitySettingsComponent,
    SpeakOnInteractionDirective,
    AccessibilitySoundDirective,
    UniversalAccessibilitySoundDirective
  ],
  exports: [
    // Export standalone components and directives for use in other modules
    AccessibilitySettingsComponent,
    SpeakOnInteractionDirective,
    AccessibilitySoundDirective,
    UniversalAccessibilitySoundDirective
  ],
  providers: [
    // Services are provided in root via @Injectable({ providedIn: 'root' })
    // But we can ensure proper initialization order with APP_INITIALIZER
    {
      provide: APP_INITIALIZER,
      useFactory: initializeAccessibility,
      deps: [
        AccessibilitySettingsService,
        GestureNavigationService,
        GlobalAccessibilitySoundService,
        TranslateService,
        PLATFORM_ID
      ],
      multi: true
    }
  ]
})
export class AccessibilityModule { }

/**
 * Re-export all accessibility services for convenience
 */
export type { AccessibilitySettings } from './services/accessibility-settings.service';
export { AccessibilitySettingsService } from './services/accessibility-settings.service';
export { TtsService } from './services/tts.service';
export type { VoiceSearchResult, VoiceState } from './services/voice.service';
export { VoiceService } from './services/voice.service';
export type { VoiceCommand, VoiceNavigationState, VoiceActionType } from './services/voice-navigation.service';
export { VoiceNavigationService } from './services/voice-navigation.service';
export type { GestureEvent, GestureType } from './services/gesture-navigation.service';
export { GestureNavigationService } from './services/gesture-navigation.service';
export type { SoundType } from './services/sound.service';
export { SoundService } from './services/sound.service';
export { GlobalAccessibilitySoundService } from './services/global-accessibility-sound.service';

/**
 * Re-export all accessibility directives for convenience
 */
export { SpeakOnInteractionDirective } from './directives/speak-on-interaction.directive';
export { AccessibilitySoundDirective } from './directives/accessibility-sound.directive';
export { UniversalAccessibilitySoundDirective } from './directives/universal-accessibility-sound.directive';

/**
 * Re-export accessibility component
 */
export { AccessibilitySettingsComponent } from './components/accessibility-settings/accessibility-settings.component';
