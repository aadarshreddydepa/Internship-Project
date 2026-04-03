import { Directive, ElementRef, HostListener, Input, OnInit, Renderer2 } from '@angular/core';
import { GlobalAccessibilitySoundService } from '../services/global-accessibility-sound.service';

/**
 * Universal Accessibility Sound Directive
 * Automatically adds click sounds to ALL buttons and interactive elements
 * 
 * Apply globally via: <body appAccessibilitySound></body>
 * Or individually: <button appAccessibilitySound soundType="success">Save</button>
 */
@Directive({
  selector: '[appAccessibilitySound], button, [role="button"], a[href], input[type="submit"], input[type="button"]',
  standalone: true
})
export class UniversalAccessibilitySoundDirective implements OnInit {
  @Input() soundType: 'click' | 'success' | 'error' | 'focus' | 'notification' | 'none' = 'click';
  @Input() soundEnabled: boolean = true;
  @Input() ariaAnnouncement: string = '';

  private isInitialized = false;

  constructor(
    private elementRef: ElementRef,
    private renderer: Renderer2,
    private globalSound: GlobalAccessibilitySoundService
  ) {}

  ngOnInit(): void {
    // Add accessibility attributes
    const element = this.elementRef.nativeElement;
    
    // Add ARIA label if not present
    if (this.ariaAnnouncement && !element.hasAttribute('aria-label')) {
      element.setAttribute('aria-label', this.ariaAnnouncement);
    }
    
    // Make element focusable if not natively interactive
    if (!element.hasAttribute('tabindex') && 
        element.tagName !== 'BUTTON' && 
        element.tagName !== 'A' &&
        element.tagName !== 'INPUT') {
      element.setAttribute('tabindex', '0');
    }
    
    // Add CSS class for styling
    this.renderer.addClass(element, 'accessibility-sound-enabled');
    
    // Add role if not present
    if (!element.hasAttribute('role') && 
        element.tagName !== 'BUTTON' && 
        element.tagName !== 'A' &&
        element.tagName !== 'INPUT') {
      element.setAttribute('role', 'button');
    }
    
    this.isInitialized = true;
  }

  @HostListener('click', ['$event'])
  onClick(event: MouseEvent): void {
    if (this.soundEnabled && this.soundType !== 'none') {
      this.playAppropriateSound();
    }
  }

  @HostListener('keydown.enter', ['$event'])
  @HostListener('keydown.space', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    if (this.soundEnabled && this.soundType !== 'none') {
      this.playAppropriateSound();
    }
  }

  @HostListener('focus')
  onFocus(): void {
    if (this.soundEnabled && this.soundType === 'focus') {
      this.globalSound.playFocus();
    }
  }

  private playAppropriateSound(): void {
    if (!this.globalSound.isEnabled()) return;
    
    switch (this.soundType) {
      case 'click':
        this.globalSound.playClick();
        break;
      case 'success':
        this.globalSound.playSuccess();
        break;
      case 'error':
        this.globalSound.playError();
        break;
      case 'focus':
        this.globalSound.playFocus();
        break;
      default:
        this.globalSound.playClick();
    }
  }
}
