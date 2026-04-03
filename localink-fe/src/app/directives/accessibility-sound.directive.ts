import { Directive, ElementRef, HostListener, Input, OnInit } from '@angular/core';
import { SoundService } from '../services/sound.service';

/**
 * Accessibility sound directive
 * Plays sounds on button clicks and other interactions for visually impaired users
 * 
 * Usage: <button appAccessibilitySound soundType="click">Click me</button>
 *        <button appAccessibilitySound [enabled]="isSoundEnabled">Click me</button>
 */
@Directive({
  selector: '[appAccessibilitySound]',
  standalone: true
})
export class AccessibilitySoundDirective implements OnInit {
  @Input() soundType: 'click' | 'success' | 'error' | 'focus' | 'notification' = 'click';
  @Input() soundEnabled: boolean = true;
  @Input() ariaLabel: string = '';

  constructor(
    private elementRef: ElementRef,
    private soundService: SoundService
  ) {}

  ngOnInit(): void {
    // Add ARIA attributes for accessibility
    const element = this.elementRef.nativeElement;
    
    if (this.ariaLabel) {
      element.setAttribute('aria-label', this.ariaLabel);
    }
    
    // Ensure element is focusable
    if (!element.hasAttribute('tabindex') && 
        element.tagName !== 'BUTTON' && 
        element.tagName !== 'A' &&
        element.tagName !== 'INPUT') {
      element.setAttribute('tabindex', '0');
    }
  }

  @HostListener('click')
  onClick(): void {
    if (this.soundEnabled) {
      this.playSound();
    }
  }

  @HostListener('keydown.enter')
  @HostListener('keydown.space')
  onKeydown(): void {
    if (this.soundEnabled) {
      this.playSound();
    }
  }

  @HostListener('focus')
  onFocus(): void {
    if (this.soundEnabled && this.soundType === 'focus') {
      this.soundService.play('focus');
    }
  }

  private playSound(): void {
    try {
      switch (this.soundType) {
        case 'click':
          this.soundService.playClick();
          break;
        case 'success':
          this.soundService.playSuccess();
          break;
        case 'error':
          this.soundService.playError();
          break;
        case 'focus':
          this.soundService.play('focus');
          break;
        case 'notification':
          this.soundService.play('notification');
          break;
        default:
          this.soundService.playClick();
      }
    } catch (error) {
      console.warn('Sound play failed:', error);
    }
  }
}
