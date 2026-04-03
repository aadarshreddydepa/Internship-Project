import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

export interface SoundConfig {
  enabled: boolean;
  volume: number;
}

export type SoundType = 'click' | 'success' | 'error' | 'notification' | 'search' | 'focus';

declare global {
  interface Window {
    webkitAudioContext: typeof AudioContext;
  }
}

@Injectable({
  providedIn: 'root'
})
export class SoundService {
  private audioContext: AudioContext | null = null;
  private configSubject = new BehaviorSubject<SoundConfig>({
    enabled: true,
    volume: 0.3
  });
  config$ = this.configSubject.asObservable();

  private sounds: { [key in SoundType]: string } = {
    click: 'data:audio/wav;base64,UklGRiYAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=',
    success: 'data:audio/wav;base64,UklGRiYAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=',
    error: 'data:audio/wav;base64,UklGRiYAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=',
    notification: 'data:audio/wav;base64,UklGRiYAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=',
    search: 'data:audio/wav;base64,UklGRiYAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=',
    focus: 'data:audio/wav;base64,UklGRiYAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA='
  };

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    if (isPlatformBrowser(this.platformId)) {
      this.loadPreference();
      this.initAudioContext();
    }
  }

  private loadPreference(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const saved = localStorage.getItem('localink_sound_config');
    if (saved) {
      try {
        const config = JSON.parse(saved);
        this.configSubject.next(config);
      } catch {
        console.warn('Failed to parse sound config');
      }
    }
  }

  private savePreference(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    localStorage.setItem('localink_sound_config', JSON.stringify(this.configSubject.value));
  }

  private initAudioContext(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    if ('AudioContext' in window || 'webkitAudioContext' in window) {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
  }

  private createOscillatorSound(frequency: number, duration: number, type: OscillatorType = 'sine'): void {
    if (!this.configSubject.value.enabled || !this.audioContext) {
      return;
    }

    // Resume audio context if suspended (browser policy)
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
    
    const volume = this.configSubject.value.volume;
    gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration);
  }

  play(type: SoundType): void {
    if (!this.configSubject.value.enabled) {
      return;
    }

    switch (type) {
      case 'click':
        // Short high-pitched beep
        this.createOscillatorSound(800, 0.05, 'sine');
        break;
      case 'success':
        // Pleasant ascending two-tone
        this.playSuccessSound();
        break;
      case 'error':
        // Low buzz
        this.createOscillatorSound(200, 0.3, 'sawtooth');
        break;
      case 'notification':
        // Gentle ping
        this.createOscillatorSound(600, 0.15, 'sine');
        break;
      case 'search':
        // Quick chirp
        this.createOscillatorSound(1000, 0.08, 'sine');
        break;
      case 'focus':
        // Very subtle
        this.createOscillatorSound(400, 0.03, 'sine');
        break;
    }
  }

  private playSuccessSound(): void {
    if (!this.audioContext) return;
    
    const volume = this.configSubject.value.volume;
    const now = this.audioContext.currentTime;
    
    // First tone
    const osc1 = this.audioContext.createOscillator();
    const gain1 = this.audioContext.createGain();
    osc1.connect(gain1);
    gain1.connect(this.audioContext.destination);
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(523.25, now); // C5
    gain1.gain.setValueAtTime(volume, now);
    gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
    osc1.start(now);
    osc1.stop(now + 0.15);
    
    // Second tone (slightly delayed)
    const osc2 = this.audioContext.createOscillator();
    const gain2 = this.audioContext.createGain();
    osc2.connect(gain2);
    gain2.connect(this.audioContext.destination);
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(659.25, now + 0.1); // E5
    gain2.gain.setValueAtTime(volume, now + 0.1);
    gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
    osc2.start(now + 0.1);
    osc2.stop(now + 0.25);
  }

  setEnabled(enabled: boolean): void {
    this.configSubject.next({ ...this.configSubject.value, enabled });
    this.savePreference();
  }

  setVolume(volume: number): void {
    const clampedVolume = Math.max(0, Math.min(1, volume));
    this.configSubject.next({ ...this.configSubject.value, volume: clampedVolume });
    this.savePreference();
  }

  toggle(): void {
    const newState = !this.configSubject.value.enabled;
    this.configSubject.next({ ...this.configSubject.value, enabled: newState });
    this.savePreference();
    
    // Play a sound to confirm the toggle
    if (newState) {
      setTimeout(() => this.play('click'), 100);
    }
  }

  isEnabled(): boolean {
    return this.configSubject.value.enabled;
  }

  getVolume(): number {
    return this.configSubject.value.volume;
  }

  // Accessibility helper: play sound for button clicks
  playClick(): void {
    this.play('click');
  }

  // Accessibility helper: play sound for successful operations
  playSuccess(): void {
    this.play('success');
  }

  // Accessibility helper: play sound for errors
  playError(): void {
    this.play('error');
  }

  // Accessibility helper: play sound for notifications
  playNotification(): void {
    this.play('notification');
  }
}
