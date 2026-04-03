import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

/**
 * Global accessibility sound service
 * Automatically adds click sounds to all interactive elements
 */
@Injectable({
  providedIn: 'root'
})
export class GlobalAccessibilitySoundService {
  private audioContext: AudioContext | null = null;
  private isInitialized = false;
  private enabled = true;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    if (isPlatformBrowser(this.platformId)) {
      this.loadSettings();
      this.initializeOnFirstInteraction();
    }
  }

  private loadSettings(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const saved = localStorage.getItem('accessibility_sound_enabled');
    this.enabled = saved !== null ? saved === 'true' : true;
  }

  saveSettings(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    localStorage.setItem('accessibility_sound_enabled', this.enabled.toString());
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  setEnabled(value: boolean): void {
    this.enabled = value;
    this.saveSettings();
  }

  toggle(): void {
    this.enabled = !this.enabled;
    this.saveSettings();
    if (this.enabled) {
      this.playClick();
    }
  }

  /**
   * Initialize audio on first user interaction (required by browsers)
   */
  private initializeOnFirstInteraction(): void {
    const initEvents = ['click', 'touchstart', 'keydown'];
    
    const initHandler = () => {
      if (!this.isInitialized) {
        this.initializeAudio();
        this.attachGlobalListeners();
        this.isInitialized = true;
      }
      // Remove init listeners after first interaction
      initEvents.forEach(event => {
        document.removeEventListener(event, initHandler, true);
      });
    };

    initEvents.forEach(event => {
      document.addEventListener(event, initHandler, { once: true, capture: true });
    });
  }

  private initializeAudio(): void {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      if (this.audioContext.state === 'suspended') {
        this.audioContext.resume();
      }
    } catch (e) {
      console.warn('Web Audio API not supported');
    }
  }

  private attachGlobalListeners(): void {
    // Add click sounds to all buttons and interactive elements
    document.addEventListener('click', (e) => {
      if (!this.enabled) return;
      
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'BUTTON' ||
        target.closest('button') ||
        target.tagName === 'A' ||
        target.closest('a') ||
        target.classList.contains('clickable') ||
        target.closest('.clickable')
      ) {
        this.playClick();
      }
    }, true);

    // Add focus sounds for keyboard navigation
    document.addEventListener('focusin', (e) => {
      if (!this.enabled) return;
      
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'BUTTON' ||
        target.tagName === 'A' ||
        target.tagName === 'INPUT' ||
        target.tagName === 'SELECT' ||
        target.tagName === 'TEXTAREA' ||
        target.getAttribute('role') === 'button'
      ) {
        this.playFocus();
      }
    });
  }

  playClick(): void {
    if (!this.enabled || !this.audioContext) return;
    
    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(400, this.audioContext.currentTime + 0.1);
      
      gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
      
      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + 0.1);
    } catch (e) {
      // Ignore audio errors
    }
  }

  playFocus(): void {
    if (!this.enabled || !this.audioContext) return;
    
    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      oscillator.frequency.setValueAtTime(600, this.audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(800, this.audioContext.currentTime + 0.05);
      
      gainNode.gain.setValueAtTime(0.05, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.05);
      
      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + 0.05);
    } catch (e) {
      // Ignore audio errors
    }
  }

  playSuccess(): void {
    if (!this.enabled || !this.audioContext) return;
    
    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      oscillator.frequency.setValueAtTime(523.25, this.audioContext.currentTime); // C5
      oscillator.frequency.setValueAtTime(659.25, this.audioContext.currentTime + 0.1); // E5
      oscillator.frequency.setValueAtTime(783.99, this.audioContext.currentTime + 0.2); // G5
      
      gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 0.3);
      
      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + 0.3);
    } catch (e) {
      // Ignore audio errors
    }
  }

  playError(): void {
    if (!this.enabled || !this.audioContext) return;
    
    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      oscillator.type = 'sawtooth';
      oscillator.frequency.setValueAtTime(150, this.audioContext.currentTime);
      oscillator.frequency.linearRampToValueAtTime(100, this.audioContext.currentTime + 0.2);
      
      gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 0.2);
      
      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + 0.2);
    } catch (e) {
      // Ignore audio errors
    }
  }
}
