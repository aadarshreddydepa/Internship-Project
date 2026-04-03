import { Injectable, Inject, PLATFORM_ID, EventEmitter } from '@angular/core';
import { Subject, Observable, fromEvent, merge, Subscription } from 'rxjs';
import { filter, throttleTime, takeUntil, map } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { TtsService } from './tts.service';
import { AccessibilitySettingsService } from './accessibility-settings.service';
import { SoundService } from './sound.service';
import { TranslateService } from '@ngx-translate/core';

/**
 * Gesture Types
 */
export type GestureType =
  | 'swipeLeft'
  | 'swipeRight'
  | 'swipeUp'
  | 'swipeDown'
  | 'tap'
  | 'doubleTap'
  | 'longPress'
  | 'keyUp'
  | 'keyDown'
  | 'keyLeft'
  | 'keyRight'
  | 'keyEnter'
  | 'keyEscape'
  | 'keyTab';

/**
 * Gesture Event Data
 */
export interface GestureEvent {
  type: GestureType;
  target?: HTMLElement;
  timestamp: number;
  x?: number;
  y?: number;
  key?: string;
  shiftKey?: boolean;
  ctrlKey?: boolean;
}

/**
 * Touch Point Data
 */
interface TouchPoint {
  x: number;
  y: number;
  time: number;
}

/**
 * GestureNavigationService
 *
 * Lightweight gesture and keyboard navigation system for accessibility.
 * Implements touch gestures and keyboard shortcuts for hands-free navigation.
 *
 * Features:
 * - Touch Gestures:
 *   - Single tap: Speak element
 *   - Double tap: Activate element
 *   - Long press: Repeat speech
 *   - Swipe left/right: Navigate lists
 *   - Swipe up/down: Scroll sections
 *
 * - Keyboard Navigation:
 *   - Arrow keys: Navigate
 *   - Enter: Activate
 *   - Escape: Go back
 *   - Tab: Next element
 *
 * - Accessibility:
 *   - Works with TTS
 *   - Announces actions
 *   - Respects settings
 */
@Injectable({
  providedIn: 'root'
})
export class GestureNavigationService {
  private gestureSubject = new Subject<GestureEvent>();
  public gestures$: Observable<GestureEvent> = this.gestureSubject.asObservable();

  private enabled = false;
  private subscriptions: Subscription[] = [];

  // Touch tracking
  private touchStart: TouchPoint | null = null;
  private lastTapTime = 0;
  private tapCount = 0;
  private longPressTimer: any = null;
  private touchHandled = false;

  // Gesture thresholds
  private readonly SWIPE_THRESHOLD = 50; // minimum distance for swipe
  private readonly TAP_THRESHOLD = 10; // maximum movement for tap
  private readonly DOUBLE_TAP_DELAY = 300; // ms between taps
  private readonly LONG_PRESS_DELAY = 500; // ms for long press

  constructor(
    private router: Router,
    private ttsService: TtsService,
    private settingsService: AccessibilitySettingsService,
    private soundService: SoundService,
    private translate: TranslateService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.setupSettingsSubscription();
  }

  /**
   * Subscribe to settings changes
   */
  private setupSettingsSubscription(): void {
    this.settingsService.settings$.subscribe(settings => {
      const shouldEnable = settings.gestureNavigation;
      if (shouldEnable !== this.enabled) {
        if (shouldEnable) {
          this.enable();
        } else {
          this.disable();
        }
      }
    });
  }

  /**
   * Enable gesture navigation
   */
  enable(): void {
    if (!isPlatformBrowser(this.platformId) || this.enabled) {
      return;
    }

    this.enabled = true;
    this.setupEventListeners();
  }

  /**
   * Disable gesture navigation
   */
  disable(): void {
    if (!this.enabled) {
      return;
    }

    this.enabled = false;
    this.cleanupSubscriptions();
  }

  /**
   * Check if gesture navigation is enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Setup all event listeners
   */
  private setupEventListeners(): void {
    this.setupTouchListeners();
    this.setupKeyboardListeners();
  }

  /**
   * Setup touch event listeners
   */
  private setupTouchListeners(): void {
    const touchStart$ = fromEvent<TouchEvent>(document, 'touchstart', { passive: true });
    const touchMove$ = fromEvent<TouchEvent>(document, 'touchmove', { passive: true });
    const touchEnd$ = fromEvent<TouchEvent>(document, 'touchend', { passive: true });

    // Touch start - record initial position
    this.subscriptions.push(
      touchStart$.subscribe(event => {
        this.handleTouchStart(event);
      })
    );

    // Touch move - detect swipes
    this.subscriptions.push(
      touchMove$.pipe(
        throttleTime(50),
        filter(() => this.touchStart !== null)
      ).subscribe(event => {
        this.handleTouchMove(event);
      })
    );

    // Touch end - detect taps and end swipes
    this.subscriptions.push(
      touchEnd$.subscribe(event => {
        this.handleTouchEnd(event);
      })
    );
  }

  /**
   * Setup keyboard event listeners
   */
  private setupKeyboardListeners(): void {
    const keydown$ = fromEvent<KeyboardEvent>(document, 'keydown');

    this.subscriptions.push(
      keydown$.subscribe(event => {
        this.handleKeydown(event);
      })
    );
  }

  /**
   * Handle touch start
   */
  private handleTouchStart(event: TouchEvent): void {
    const touch = event.touches[0];
    this.touchStart = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now()
    };
    this.touchHandled = false;

    // Setup long press timer
    this.longPressTimer = setTimeout(() => {
      if (this.touchStart && !this.touchHandled) {
        this.touchHandled = true;
        this.emitGesture({
          type: 'longPress',
          target: event.target as HTMLElement,
          timestamp: Date.now(),
          x: this.touchStart.x,
          y: this.touchStart.y
        });
        this.handleLongPress(event.target as HTMLElement);
      }
    }, this.LONG_PRESS_DELAY);
  }

  /**
   * Handle touch move
   */
  private handleTouchMove(event: TouchEvent): void {
    if (!this.touchStart) return;

    const touch = event.touches[0];
    const deltaX = touch.clientX - this.touchStart.x;
    const deltaY = touch.clientY - this.touchStart.y;

    // Cancel long press if moved too much
    if (Math.abs(deltaX) > this.TAP_THRESHOLD || Math.abs(deltaY) > this.TAP_THRESHOLD) {
      this.cancelLongPress();
    }
  }

  /**
   * Handle touch end
   */
  private handleTouchEnd(event: TouchEvent): void {
    this.cancelLongPress();

    if (!this.touchStart || this.touchHandled) {
      this.touchStart = null;
      return;
    }

    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - this.touchStart.x;
    const deltaY = touch.clientY - this.touchStart.y;
    const deltaTime = Date.now() - this.touchStart.time;

    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);

    // Determine gesture type
    if (absX > this.SWIPE_THRESHOLD || absY > this.SWIPE_THRESHOLD) {
      // It's a swipe
      if (absX > absY) {
        // Horizontal swipe
        const type: GestureType = deltaX > 0 ? 'swipeRight' : 'swipeLeft';
        this.emitGesture({
          type,
          target: event.target as HTMLElement,
          timestamp: Date.now(),
          x: touch.clientX,
          y: touch.clientY
        });
        this.handleSwipe(type, event.target as HTMLElement);
      } else {
        // Vertical swipe
        const type: GestureType = deltaY > 0 ? 'swipeDown' : 'swipeUp';
        this.emitGesture({
          type,
          target: event.target as HTMLElement,
          timestamp: Date.now(),
          x: touch.clientX,
          y: touch.clientY
        });
        this.handleSwipe(type, event.target as HTMLElement);
      }
    } else if (absX < this.TAP_THRESHOLD && absY < this.TAP_THRESHOLD && deltaTime < this.LONG_PRESS_DELAY) {
      // It's a tap
      const now = Date.now();
      const timeSinceLastTap = now - this.lastTapTime;

      if (timeSinceLastTap < this.DOUBLE_TAP_DELAY && this.tapCount === 1) {
        // Double tap
        this.tapCount = 0;
        this.emitGesture({
          type: 'doubleTap',
          target: event.target as HTMLElement,
          timestamp: now,
          x: touch.clientX,
          y: touch.clientY
        });
        this.handleDoubleTap(event.target as HTMLElement);
      } else {
        // Single tap (might be start of double tap)
        this.tapCount = 1;
        this.lastTapTime = now;

        // Delay single tap handling to allow for double tap
        setTimeout(() => {
          if (this.tapCount === 1) {
            this.tapCount = 0;
            this.emitGesture({
              type: 'tap',
              target: event.target as HTMLElement,
              timestamp: Date.now(),
              x: touch.clientX,
              y: touch.clientY
            });
            this.handleSingleTap(event.target as HTMLElement);
          }
        }, this.DOUBLE_TAP_DELAY);
      }
    }

    this.touchStart = null;
  }

  /**
   * Cancel long press timer
   */
  private cancelLongPress(): void {
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
      this.longPressTimer = null;
    }
  }

  /**
   * Handle keyboard events
   */
  private handleKeydown(event: KeyboardEvent): void {
    // Only process if gesture navigation is enabled and not in input field
    if (!this.enabled) return;

    const target = event.target as HTMLElement;
    const isInputElement = target.tagName === 'INPUT' ||
                          target.tagName === 'TEXTAREA' ||
                          target.isContentEditable;

    let gestureType: GestureType | null = null;

    switch (event.key) {
      case 'ArrowLeft':
        if (!isInputElement) {
          gestureType = 'keyLeft';
          event.preventDefault();
        }
        break;
      case 'ArrowRight':
        if (!isInputElement) {
          gestureType = 'keyRight';
          event.preventDefault();
        }
        break;
      case 'ArrowUp':
        if (!isInputElement) {
          gestureType = 'keyUp';
          event.preventDefault();
        }
        break;
      case 'ArrowDown':
        if (!isInputElement) {
          gestureType = 'keyDown';
          event.preventDefault();
        }
        break;
      case 'Enter':
        gestureType = 'keyEnter';
        break;
      case 'Escape':
        gestureType = 'keyEscape';
        event.preventDefault();
        break;
      case 'Tab':
        gestureType = 'keyTab';
        break;
    }

    if (gestureType) {
      this.emitGesture({
        type: gestureType,
        target,
        timestamp: Date.now(),
        key: event.key,
        shiftKey: event.shiftKey,
        ctrlKey: event.ctrlKey
      });
      this.handleKeyboardGesture(gestureType, target);
    }
  }

  /**
   * Emit gesture event
   */
  private emitGesture(event: GestureEvent): void {
    this.gestureSubject.next(event);

    // Play sound feedback if enabled
    if (this.settingsService.isSoundFeedbackEnabled()) {
      if (event.type.startsWith('swipe')) {
        this.soundService.play('focus');
      } else if (event.type === 'tap' || event.type === 'doubleTap') {
        this.soundService.play('click');
      }
    }
  }

  /**
   * Handle single tap
   */
  private handleSingleTap(target: HTMLElement): void {
    // Find the nearest interactive element
    const element = this.findInteractiveElement(target);
    if (element) {
      // Speak the element description
      this.speakElement(element);
    }
  }

  /**
   * Handle double tap
   */
  private handleDoubleTap(target: HTMLElement): void {
    // Find the nearest interactive element
    const element = this.findInteractiveElement(target);
    if (element) {
      // Activate the element (click it)
      element.click();

      // Announce activation
      const label = this.getElementLabel(element);
      const activatedMsg = this.translate.instant('ACCESSIBILITY.ACTIVATED', { element: label });
      this.ttsService.speak(activatedMsg, 'normal');
    }
  }

  /**
   * Handle long press
   */
  private handleLongPress(target: HTMLElement): void {
    // Repeat speech of the element
    const element = this.findInteractiveElement(target);
    if (element) {
      const label = this.getElementLabel(element);
      this.ttsService.speak(label, 'high');
    }
  }

  /**
   * Handle swipe gestures
   */
  private handleSwipe(type: GestureType, target: HTMLElement): void {
    const message = this.translate.instant('ACCESSIBILITY.SWIPE_DETECTED', { direction: type.replace('swipe', '') });
    this.ttsService.speak(message, 'normal');

    // Handle swipe in lists
    const listContainer = this.findListContainer(target);
    if (listContainer) {
      switch (type) {
        case 'swipeLeft':
        case 'swipeRight':
          this.navigateList(listContainer, type === 'swipeRight' ? 'next' : 'prev');
          break;
        case 'swipeUp':
        case 'swipeDown':
          this.scrollContainer(listContainer, type === 'swipeDown' ? 300 : -300);
          break;
      }
    } else {
      // Global swipe handling
      switch (type) {
        case 'swipeLeft':
          // Could trigger next page or next item
          break;
        case 'swipeRight':
          // Could trigger previous page or previous item
          break;
        case 'swipeUp':
          if (isPlatformBrowser(this.platformId)) {
            window.scrollBy({ top: -300, behavior: 'smooth' });
          }
          break;
        case 'swipeDown':
          if (isPlatformBrowser(this.platformId)) {
            window.scrollBy({ top: 300, behavior: 'smooth' });
          }
          break;
      }
    }
  }

  /**
   * Handle keyboard gestures
   */
  private handleKeyboardGesture(type: GestureType, target: HTMLElement): void {
    switch (type) {
      case 'keyLeft':
      case 'keyRight':
        // Navigate horizontally
        break;
      case 'keyUp':
        if (isPlatformBrowser(this.platformId)) {
          window.scrollBy({ top: -100, behavior: 'smooth' });
        }
        break;
      case 'keyDown':
        if (isPlatformBrowser(this.platformId)) {
          window.scrollBy({ top: 100, behavior: 'smooth' });
        }
        break;
      case 'keyEscape':
        const backMsg = this.translate.instant('ACCESSIBILITY.GOING_BACK');
        this.ttsService.speak(backMsg, 'normal');
        this.router.navigate(['../']);
        break;
      case 'keyEnter':
        // Element activation is handled by browser
        if (target) {
          const label = this.getElementLabel(target);
          this.ttsService.speak(this.translate.instant('ACCESSIBILITY.ACTIVATED', { element: label }), 'normal');
        }
        break;
    }
  }

  /**
   * Find the nearest interactive element
   */
  private findInteractiveElement(target: HTMLElement): HTMLElement | null {
    let element: HTMLElement | null = target;

    while (element && element !== document.body) {
      if (this.isInteractiveElement(element)) {
        return element;
      }
      element = element.parentElement;
    }

    return null;
  }

  /**
   * Check if element is interactive
   */
  private isInteractiveElement(element: HTMLElement): boolean {
    return element.tagName === 'BUTTON' ||
           element.tagName === 'A' ||
           element.tagName === 'INPUT' ||
           element.tagName === 'SELECT' ||
           element.tagName === 'TEXTAREA' ||
           element.getAttribute('role') === 'button' ||
           element.classList.contains('clickable') ||
           element.hasAttribute('tabindex');
  }

  /**
   * Find list container
   */
  private findListContainer(target: HTMLElement): HTMLElement | null {
    let element: HTMLElement | null = target;

    while (element && element !== document.body) {
      if (element.getAttribute('role') === 'list' ||
          element.tagName === 'UL' ||
          element.tagName === 'OL' ||
          element.classList.contains('list-container')) {
        return element;
      }
      element = element.parentElement;
    }

    return null;
  }

  /**
   * Navigate within a list
   */
  private navigateList(container: HTMLElement, direction: 'next' | 'prev'): void {
    const items = container.querySelectorAll('[role="listitem"], li, .list-item');
    const focusedElement = document.activeElement as HTMLElement;

    let currentIndex = -1;
    items.forEach((item, index) => {
      if (item === focusedElement || item.contains(focusedElement)) {
        currentIndex = index;
      }
    });

    let nextIndex: number;
    if (direction === 'next') {
      nextIndex = currentIndex + 1;
      if (nextIndex >= items.length) nextIndex = 0;
    } else {
      nextIndex = currentIndex - 1;
      if (nextIndex < 0) nextIndex = items.length - 1;
    }

    const nextItem = items[nextIndex] as HTMLElement;
    if (nextItem) {
      nextItem.focus();
      nextItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      this.speakElement(nextItem);
    }
  }

  /**
   * Scroll a container
   */
  private scrollContainer(container: HTMLElement, amount: number): void {
    container.scrollBy({ top: amount, behavior: 'smooth' });
  }

  /**
   * Get element label for speech
   */
  private getElementLabel(element: HTMLElement): string {
    // Check for aria-label
    let label = element.getAttribute('aria-label');
    if (label) return label;

    // Check for aria-labelledby
    const labelledBy = element.getAttribute('aria-labelledby');
    if (labelledBy) {
      const labelElement = document.getElementById(labelledBy);
      if (labelElement) {
        return labelElement.textContent || '';
      }
    }

    // Check for inner text (but not too long)
    const text = element.textContent?.trim();
    if (text && text.length < 100) {
      return text;
    }

    // Check for title
    const title = element.getAttribute('title');
    if (title) return title;

    // Check for placeholder (for inputs)
    if (element.tagName === 'INPUT') {
      const placeholder = element.getAttribute('placeholder');
      if (placeholder) return placeholder;
    }

    // Check for alt (for images)
    if (element.tagName === 'IMG') {
      const alt = element.getAttribute('alt');
      if (alt) return alt;
    }

    // Default based on element type
    switch (element.tagName) {
      case 'BUTTON':
        return this.translate.instant('ACCESSIBILITY.BUTTON');
      case 'A':
        return this.translate.instant('ACCESSIBILITY.LINK');
      case 'INPUT':
        return this.translate.instant('ACCESSIBILITY.INPUT_FIELD');
      default:
        return this.translate.instant('ACCESSIBILITY.INTERACTIVE_ELEMENT');
    }
  }

  /**
   * Speak element description
   */
  private speakElement(element: HTMLElement): void {
    if (!this.settingsService.isVoiceGuidanceEnabled()) {
      return;
    }

    const label = this.getElementLabel(element);
    if (label) {
      this.ttsService.speak(label, 'normal');
    }
  }

  /**
   * Cleanup all subscriptions
   */
  private cleanupSubscriptions(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.subscriptions = [];
    this.cancelLongPress();
  }

  /**
   * Get gesture help text
   */
  getGestureHelp(): string {
    return this.translate.instant('ACCESSIBILITY.GESTURE_HELP');
  }

  /**
   * Announce current page for orientation
   */
  announcePage(route: string): void {
    if (!this.settingsService.isVoiceGuidanceEnabled()) {
      return;
    }

    const pageNames: { [key: string]: string } = {
      '/home': this.translate.instant('NAV.HOME'),
      '/profile': this.translate.instant('NAV.PROFILE'),
      '/categories': this.translate.instant('NAV.CATEGORIES'),
      '/business-list': this.translate.instant('DASHBOARD.SEARCH_RESULTS'),
      '/login': this.translate.instant('LOGIN.TITLE'),
      '/signup': this.translate.instant('SIGNUP.USER_SUBTITLE')
    };

    const pageName = pageNames[route] || route;
    const announcement = this.translate.instant('ACCESSIBILITY.ON_PAGE', { page: pageName });
    this.ttsService.speak(announcement, 'high');
  }
}
