import {
  Directive,
  ElementRef,
  HostListener,
  Input,
  OnInit,
  OnDestroy,
  Renderer2,
  Inject,
  PLATFORM_ID
} from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';
import { TtsService } from '../services/tts.service';
import { AccessibilitySettingsService } from '../services/accessibility-settings.service';
import { TranslateService } from '@ngx-translate/core';
import { SoundService } from '../services/sound.service';

/**
 * SpeakOnInteractionDirective
 *
 * A reusable directive that triggers text-to-speech when users interact with UI elements.
 * Supports mouse hover, keyboard focus, and touch events.
 *
 * Usage:
 *   <!-- With translation key -->
 *   <input appSpeakOnInteraction [speakTextKey]="'search.placeholder'" />
 *
 *   <!-- With direct text (fallback) -->
 *   <button appSpeakOnInteraction speakText="Click to search">Search</button>
 *
 *   <!-- Custom priority -->
 *   <div appSpeakOnInteraction [speakTextKey]="'navigation.home'" speakPriority="high">Home</div>
 *
 *   <!-- Custom debounce -->
 *   <li appSpeakOnInteraction [speakTextKey]="'item.description'" [speakDebounce]="200">Item</li>
 *
 * Features:
 * - Debounced speech (prevents spam)
 * - Cancel previous speech before new one
 * - Multilingual support via ngx-translate
 * - Respects accessibility settings
 * - Prevents repeated triggering
 * - Touch-friendly for mobile
 */
@Directive({
  selector: '[appSpeakOnInteraction]',
  standalone: true
})
export class SpeakOnInteractionDirective implements OnInit, OnDestroy {
  /** Translation key to speak (preferred method) */
  @Input() speakTextKey: string = '';

  /** Direct text to speak (fallback if no key provided) */
  @Input() speakText: string = '';

  /** Speech priority: 'high' cancels previous speech, 'normal' waits */
  @Input() speakPriority: 'high' | 'normal' = 'normal';

  /** Debounce time in milliseconds (default: 150ms) */
  @Input() speakDebounce: number = 150;

  /** Enable touch feedback (default: true) */
  @Input() speakOnTouch: boolean = true;

  /** Enable hover feedback (default: true) */
  @Input() speakOnHover: boolean = true;

  /** Enable focus feedback (default: true) */
  @Input() speakOnFocus: boolean = true;

  /** Additional context to append to speech (e.g., element type) */
  @Input() speakContext: string = '';

  private destroy$ = new Subject<void>();
  private speechQueue = new Subject<string>();
  private lastSpokenText: string = '';
  private lastSpokenTime: number = 0;
  private isTouchDevice: boolean = false;
  private touchHandled: boolean = false;

  constructor(
    private elementRef: ElementRef,
    private renderer: Renderer2,
    private ttsService: TtsService,
    private settingsService: AccessibilitySettingsService,
    private translate: TranslateService,
    private soundService: SoundService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isTouchDevice = isPlatformBrowser(this.platformId) &&
      ('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }

  ngOnInit(): void {
    // Setup debounced speech queue
    this.speechQueue.pipe(
      takeUntil(this.destroy$),
      debounceTime(this.speakDebounce)
    ).subscribe(text => {
      this.speak(text);
    });

    // Add ARIA attributes for accessibility
    this.setupAccessibility();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Setup ARIA attributes and accessibility features
   */
  private setupAccessibility(): void {
    const element = this.elementRef.nativeElement;

    // Ensure element has proper role if not interactive
    if (!element.hasAttribute('role') &&
        element.tagName !== 'BUTTON' &&
        element.tagName !== 'A' &&
        element.tagName !== 'INPUT' &&
        element.tagName !== 'SELECT' &&
        element.tagName !== 'TEXTAREA') {
      this.renderer.setAttribute(element, 'role', 'button');
    }

    // Ensure element is focusable
    if (!element.hasAttribute('tabindex') &&
        element.tagName !== 'BUTTON' &&
        element.tagName !== 'A' &&
        element.tagName !== 'INPUT' &&
        element.tagName !== 'SELECT' &&
        element.tagName !== 'TEXTAREA') {
      this.renderer.setAttribute(element, 'tabindex', '0');
    }

    // Add visual focus indicator class
    this.renderer.addClass(element, 'accessibility-focusable');
  }

  /**
   * Handle mouse enter (hover) event
   */
  @HostListener('mouseenter')
  onMouseEnter(): void {
    // Skip hover on touch devices to prevent double-triggering
    if (this.isTouchDevice || !this.speakOnHover) {
      return;
    }

    this.queueSpeech();
  }

  /**
   * Handle focus event (keyboard navigation)
   */
  @HostListener('focus')
  onFocus(): void {
    if (!this.speakOnFocus) {
      return;
    }

    // Play focus sound if sound feedback is enabled
    const settings = this.settingsService.getSettings();
    if (settings.soundFeedback) {
      this.soundService.play('focus');
    }

    this.queueSpeech();
  }

  /**
   * Handle touch start event (mobile)
   */
  @HostListener('touchstart')
  onTouchStart(): void {
    if (!this.speakOnTouch) {
      return;
    }

    this.touchHandled = true;
    this.queueSpeech();
  }

  /**
   * Queue text for speech with debounce
   */
  private queueSpeech(): void {
    // Check if voice guidance is enabled
    if (!this.settingsService.isVoiceGuidanceEnabled()) {
      return;
    }

    const textToSpeak = this.getTextToSpeak();
    if (!textToSpeak) {
      return;
    }

    // Prevent immediate repeated speech of same text
    const now = Date.now();
    if (textToSpeak === this.lastSpokenText && (now - this.lastSpokenTime) < 1000) {
      return;
    }

    this.speechQueue.next(textToSpeak);
  }

  /**
   * Get the text to speak (from translation key or direct text)
   */
  private getTextToSpeak(): string {
    let text = '';

    // Try translation key first
    if (this.speakTextKey) {
      text = this.translate.instant(this.speakTextKey);
      // If translation returns the key itself, it means key not found
      if (text === this.speakTextKey) {
        text = '';
      }
    }

    // Fallback to direct text
    if (!text && this.speakText) {
      text = this.speakText;
    }

    // Add context if provided
    if (text && this.speakContext) {
      const contextText = this.translate.instant(this.speakContext);
      text = `${text}. ${contextText}`;
    }

    return text;
  }

  /**
   * Speak the text using TTS service
   */
  private speak(text: string): void {
    if (!text) {
      return;
    }

    // Update tracking
    this.lastSpokenText = text;
    this.lastSpokenTime = Date.now();

    // Use TTS service to speak
    this.ttsService.speak(text, this.speakPriority);
  }

  /**
   * Force immediate speech (for external triggers)
   */
  speakImmediately(): void {
    const text = this.getTextToSpeak();
    if (text) {
      this.lastSpokenText = text;
      this.lastSpokenTime = Date.now();
      this.ttsService.speak(text, 'high');
    }
  }

  /**
   * Check if this element recently spoke the given text
   */
  recentlySpoke(text: string, withinMs: number = 1000): boolean {
    return this.lastSpokenText === text &&
           (Date.now() - this.lastSpokenTime) < withinMs;
  }
}
