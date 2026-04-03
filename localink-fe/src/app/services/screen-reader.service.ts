import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

/**
 * Screen reader service for accessibility announcements
 * Manages ARIA live regions and announcements for visually impaired users
 */
@Injectable({
  providedIn: 'root'
})
export class ScreenReaderService {
  private announcementSubject = new Subject<string>();
  announcements$ = this.announcementSubject.asObservable();

  // Priority levels for announcements
  announce(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
    this.announcementSubject.next(message);
    
    // Also use native speech synthesis if enabled
    if (this.isScreenReaderActive()) {
      this.speakWithScreenReader(message);
    }
  }

  announcePageChange(pageName: string): void {
    this.announce(`Navigated to ${pageName}`, 'assertive');
  }

  announceSearchResults(count: number, query: string): void {
    if (count === 0) {
      this.announce(`No results found for ${query}`, 'polite');
    } else if (count === 1) {
      this.announce(`Found 1 result for ${query}`, 'polite');
    } else {
      this.announce(`Found ${count} results for ${query}`, 'polite');
    }
  }

  announceError(message: string): void {
    this.announce(`Error: ${message}`, 'assertive');
  }

  announceSuccess(message: string): void {
    this.announce(`Success: ${message}`, 'polite');
  }

  announceLoading(message: string = 'Loading'): void {
    this.announce(`${message}, please wait`, 'polite');
  }

  announceFormError(fieldName: string, errorMessage: string): void {
    this.announce(`${fieldName} error: ${errorMessage}`, 'assertive');
  }

  private isScreenReaderActive(): boolean {
    // Check if user has indicated screen reader usage (via localStorage or system)
    return localStorage.getItem('screenReaderEnabled') === 'true' || 
           'ontouchstart' in window && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  private speakWithScreenReader(message: string): void {
    // Use speech synthesis for direct announcement
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(message);
      utterance.rate = 1;
      utterance.pitch = 1;
      utterance.volume = 1;
      window.speechSynthesis.speak(utterance);
    }
  }
}
