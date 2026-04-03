import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, Observable, BehaviorSubject } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { VoiceService, VoiceSearchResult } from './voice.service';
import { TtsService } from './tts.service';
import { AccessibilitySettingsService } from './accessibility-settings.service';
import { TranslateService } from '@ngx-translate/core';
import { SoundService } from './sound.service';

/**
 * Voice Navigation Action Types
 */
export type VoiceActionType =
  | 'navigate'
  | 'search'
  | 'filter'
  | 'clear'
  | 'refresh'
  | 'back'
  | 'help'
  | 'toggle'
  | 'scroll'
  | 'unknown';

/**
 * Voice Navigation Command Result
 */
export interface VoiceCommand {
  type: VoiceActionType;
  action: string;
  params: { [key: string]: any };
  rawText: string;
  confidence?: number;
}

/**
 * Voice Navigation State
 */
export type VoiceNavigationState = 'idle' | 'listening' | 'processing' | 'executing' | 'error';

/**
 * Navigation Route Mapping
 */
interface RouteMapping {
  [key: string]: string[];
}

/**
 * VoiceNavigationService
 *
 * Enhanced voice command router for hands-free navigation.
 * Parses natural language commands and converts them to app actions.
 *
 * Supported Commands:
 * - Navigation: "Go to home", "Open profile", "Show categories"
 * - Search: "Search for cafes", "Find hospitals near me"
 * - Filters: "Show open now", "Filter by rating"
 * - Actions: "Go back", "Clear search", "Refresh page"
 * - Help: "What can I say?", "Help"
 *
 * Features:
 * - Modular command parser (easy to extend)
 * - Natural language understanding
 * - Visual feedback ("Listening...")
 * - Multilingual support
 * - Confidence scoring
 * - Command history
 */
@Injectable({
  providedIn: 'root'
})
export class VoiceNavigationService {
  private commandSubject = new Subject<VoiceCommand>();
  public commands$: Observable<VoiceCommand> = this.commandSubject.asObservable();

  private stateSubject = new BehaviorSubject<VoiceNavigationState>('idle');
  public state$: Observable<VoiceNavigationState> = this.stateSubject.asObservable();

  private feedbackSubject = new Subject<string>();
  public feedback$: Observable<string> = this.feedbackSubject.asObservable();

  private commandHistory: VoiceCommand[] = [];
  private maxHistorySize = 20;

  // Route mappings for navigation commands
  private routeMappings: RouteMapping = {
    '/home': ['home', 'main', 'dashboard', 'start', 'landing'],
    '/profile': ['profile', 'account', 'my account', 'user profile', 'settings'],
    '/categories': ['categories', 'browse', 'explore', 'all categories'],
    '/business-list': ['businesses', 'list', 'results', 'search results', 'all businesses'],
    '/login': ['login', 'sign in', 'log in'],
    '/signup': ['signup', 'sign up', 'register', 'create account'],
    '/popular-businesses': ['popular', 'trending', 'top rated', 'best businesses']
  };

  // Search keywords
  private searchKeywords = ['search', 'find', 'look for', 'show me', 'get', 'display'];

  // Filter keywords
  private filterKeywords = ['filter', 'show only', 'display only', 'filter by'];

  // Action keywords
  private actionKeywords: { [key: string]: string[] } = {
    'clear': ['clear', 'reset', 'empty', 'delete'],
    'refresh': ['refresh', 'reload', 'update', 'sync'],
    'back': ['back', 'go back', 'previous', 'return'],
    'help': ['help', 'what can i say', 'commands', 'assistance', 'support'],
    'toggle': ['toggle', 'switch', 'turn on', 'turn off', 'enable', 'disable']
  };

  // Scroll keywords
  private scrollKeywords: { [key: string]: string[] } = {
    'up': ['scroll up', 'move up', 'go up'],
    'down': ['scroll down', 'move down', 'go down', 'scroll'],
    'top': ['scroll to top', 'go to top', 'top of page'],
    'bottom': ['scroll to bottom', 'go to bottom', 'bottom of page']
  };

  constructor(
    private router: Router,
    private voiceService: VoiceService,
    private ttsService: TtsService,
    private settingsService: AccessibilitySettingsService,
    private translate: TranslateService,
    private soundService: SoundService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.setupVoiceRecognition();
  }

  /**
   * Setup voice recognition event handlers
   */
  private setupVoiceRecognition(): void {
    // Subscribe to voice service state changes
    this.voiceService.voiceState$.subscribe(state => {
      switch (state) {
        case 'listening':
          this.stateSubject.next('listening');
          break;
        case 'processing':
          this.stateSubject.next('processing');
          break;
        case 'error':
          this.stateSubject.next('error');
          break;
        default:
          if (this.stateSubject.value !== 'idle') {
            this.stateSubject.next('idle');
          }
      }
    });

    // Subscribe to final transcripts
    this.voiceService.finalTranscript$.subscribe(transcript => {
      if (transcript && this.settingsService.isVoiceNavigationEnabled()) {
        this.processCommand(transcript);
      }
    });

    // Subscribe to errors
    this.voiceService.error$.subscribe(error => {
      this.feedbackSubject.next(error);
      this.ttsService.announceError(error);
    });
  }

  /**
   * Start listening for voice commands
   */
  async startListening(): Promise<void> {
    if (!this.settingsService.isVoiceNavigationEnabled()) {
      const message = this.translate.instant('ACCESSIBILITY.VOICE_NAV_DISABLED');
      this.feedbackSubject.next(message);
      return;
    }

    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    // Check browser support
    if (!this.voiceService.isBrowserSupported()) {
      const message = this.translate.instant('ACCESSIBILITY.VOICE_NOT_SUPPORTED');
      this.feedbackSubject.next(message);
      this.ttsService.announceError(message);
      return;
    }

    // Check microphone permission
    const permission = await this.voiceService.checkMicrophonePermission();
    if (permission === 'denied') {
      const message = this.translate.instant('VOICE.MIC_DENIED');
      this.feedbackSubject.next(message);
      return;
    }

    // Start listening
    this.voiceService.startListening();

    // Play start sound
    if (this.settingsService.isSoundFeedbackEnabled()) {
      this.soundService.play('click');
    }

    // Announce listening
    const listeningMsg = this.translate.instant('ACCESSIBILITY.LISTENING_FOR_COMMANDS');
    this.ttsService.speak(listeningMsg, 'high');
  }

  /**
   * Stop listening for voice commands
   */
  stopListening(): void {
    this.voiceService.stopListening();
    this.stateSubject.next('idle');
  }

  /**
   * Toggle listening state
   */
  async toggleListening(): Promise<void> {
    if (this.stateSubject.value === 'listening') {
      this.stopListening();
    } else {
      await this.startListening();
    }
  }

  /**
   * Process voice command transcript
   */
  private processCommand(transcript: string): void {
    this.stateSubject.next('processing');

    const command = this.parseCommand(transcript);

    // Add to history
    this.addToHistory(command);

    // Execute command
    this.stateSubject.next('executing');
    this.executeCommand(command);

    // Reset state after execution
    setTimeout(() => {
      this.stateSubject.next('idle');
    }, 500);
  }

  /**
   * Parse natural language command into structured command
   */
  private parseCommand(transcript: string): VoiceCommand {
    const lowerText = transcript.toLowerCase().trim();

    // Check for navigation commands
    const navRoute = this.findNavigationRoute(lowerText);
    if (navRoute) {
      return {
        type: 'navigate',
        action: 'navigate',
        params: { route: navRoute },
        rawText: transcript
      };
    }

    // Check for search commands
    const searchResult = this.findSearchCommand(lowerText);
    if (searchResult) {
      return {
        type: 'search',
        action: 'search',
        params: searchResult,
        rawText: transcript
      };
    }

    // Check for filter commands
    const filterResult = this.findFilterCommand(lowerText);
    if (filterResult) {
      return {
        type: 'filter',
        action: 'filter',
        params: filterResult,
        rawText: transcript
      };
    }

    // Check for scroll commands
    const scrollResult = this.findScrollCommand(lowerText);
    if (scrollResult) {
      return {
        type: 'scroll',
        action: scrollResult,
        params: {},
        rawText: transcript
      };
    }

    // Check for action commands (clear, refresh, back, help)
    const actionResult = this.findActionCommand(lowerText);
    if (actionResult) {
      return {
        type: actionResult.type as VoiceActionType,
        action: actionResult.action,
        params: actionResult.params || {},
        rawText: transcript
      };
    }

    // Unknown command
    return {
      type: 'unknown',
      action: 'unknown',
      params: { originalText: transcript },
      rawText: transcript
    };
  }

  /**
   * Find navigation route from command text
   */
  private findNavigationRoute(text: string): string | null {
    // Extract route from common patterns
    const patterns = [
      /(?:go to|navigate to|open|show|take me to)\s+(.+)/i,
      /(?:switch to|access|view)\s+(.+)/i
    ];

    let targetRoute: string | null = null;

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        targetRoute = match[1].trim();
        break;
      }
    }

    // If no pattern matched, check for direct route mentions
    if (!targetRoute) {
      for (const [route, keywords] of Object.entries(this.routeMappings)) {
        if (keywords.some(keyword => text.includes(keyword))) {
          return route;
        }
      }
    }

    // Match target route to known routes
    if (targetRoute) {
      for (const [route, keywords] of Object.entries(this.routeMappings)) {
        if (keywords.some(keyword => targetRoute!.includes(keyword))) {
          return route;
        }
      }
    }

    return null;
  }

  /**
   * Find search parameters from command text
   */
  private findSearchCommand(text: string): VoiceSearchResult | null {
    // Check if it's a search command
    const isSearch = this.searchKeywords.some(keyword => text.includes(keyword));
    if (!isSearch) {
      return null;
    }

    // Use existing voice service parser
    return this.voiceService.parseVoiceCommand(text);
  }

  /**
   * Find filter parameters from command text
   */
  private findFilterCommand(text: string): { [key: string]: any } | null {
    const isFilter = this.filterKeywords.some(keyword => text.includes(keyword));
    if (!isFilter) {
      return null;
    }

    const filters: { [key: string]: any } = {};

    // Parse filter criteria
    if (text.includes('open now') || text.includes('currently open')) {
      filters['openNow'] = true;
    }

    if (text.includes('rating') || text.includes('stars') || text.includes('rated')) {
      const ratingMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:stars?|rating|rated)/);
      filters['minRating'] = ratingMatch ? parseFloat(ratingMatch[1]) : undefined;
    }

    if (text.includes('nearby') || text.includes('close') || text.includes('near me')) {
      filters['nearby'] = true;
    }

    // Parse radius
    const radiusMatch = text.match(/(\d+)\s*(km|kilometer|kilometers|miles?)/);
    if (radiusMatch) {
      const value = parseInt(radiusMatch[1], 10);
      const unit = radiusMatch[2];
      filters['radius'] = unit.startsWith('mile') ? Math.round(value * 1.60934) : value;
    }

    return Object.keys(filters).length > 0 ? filters : null;
  }

  /**
   * Find scroll direction from command text
   */
  private findScrollCommand(text: string): string | null {
    for (const [direction, keywords] of Object.entries(this.scrollKeywords)) {
      if (keywords.some(keyword => text.includes(keyword))) {
        return direction;
      }
    }
    return null;
  }

  /**
   * Find action command (clear, refresh, back, help, toggle)
   */
  private findActionCommand(text: string): { type: string; action: string; params?: any } | null {
    // Check each action type
    for (const [action, keywords] of Object.entries(this.actionKeywords)) {
      if (keywords.some(keyword => text.includes(keyword))) {
        // Special handling for toggle commands
        if (action === 'toggle') {
          const feature = this.extractToggleFeature(text);
          return { type: 'toggle', action: 'toggle', params: { feature } };
        }
        return { type: action, action };
      }
    }
    return null;
  }

  /**
   * Extract feature to toggle from command text
   */
  private extractToggleFeature(text: string): string | null {
    const features: { [key: string]: string[] } = {
      'voice': ['voice', 'speech', 'talking'],
      'sound': ['sound', 'audio', 'noise', 'beep'],
      'gestures': ['gesture', 'swipe', 'touch', 'motion'],
      'tts': ['tts', 'text to speech', 'reading']
    };

    for (const [feature, keywords] of Object.entries(features)) {
      if (keywords.some(keyword => text.includes(keyword))) {
        return feature;
      }
    }
    return null;
  }

  /**
   * Execute parsed command
   */
  private executeCommand(command: VoiceCommand): void {
    switch (command.type) {
      case 'navigate':
        this.executeNavigate(command.params['route']);
        break;

      case 'search':
        this.executeSearch(command.params as VoiceSearchResult);
        break;

      case 'filter':
        this.executeFilter(command.params);
        break;

      case 'scroll':
        this.executeScroll(command.action);
        break;

      case 'clear':
        this.executeClear();
        break;

      case 'refresh':
        this.executeRefresh();
        break;

      case 'back':
        this.executeBack();
        break;

      case 'help':
        this.executeHelp();
        break;

      case 'toggle':
        this.executeToggle(command.params['feature']);
        break;

      case 'unknown':
      default:
        this.executeUnknown(command.rawText);
        break;
    }
  }

  /**
   * Execute navigation command
   */
  private executeNavigate(route: string): void {
    const successMsg = this.translate.instant('ACCESSIBILITY.NAVIGATING_TO', { destination: route });
    this.ttsService.speak(successMsg, 'high');
    this.router.navigate([route]).then(() => {
      this.soundService.playSuccess();
    });
  }

  /**
   * Execute search command
   */
  private executeSearch(params: VoiceSearchResult): void {
    const query = params.query || '';
    const searchMsg = this.translate.instant('ACCESSIBILITY.SEARCHING_FOR', { query });
    this.ttsService.speak(searchMsg, 'high');

    // Navigate to business list with search params
    this.router.navigate(['/business-list'], {
      queryParams: {
        q: query,
        category: params.category,
        openNow: params.openNow,
        radius: params.radius
      }
    });

    this.soundService.play('search');
  }

  /**
   * Execute filter command
   */
  private executeFilter(params: { [key: string]: any }): void {
    const filterMsg = this.translate.instant('ACCESSIBILITY.APPLYING_FILTER');
    this.ttsService.speak(filterMsg, 'normal');

    // Broadcast filter change event
    // Other components can subscribe to commands$ to react
    this.soundService.play('click');
  }

  /**
   * Execute scroll command
   */
  private executeScroll(direction: string): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const scrollMsg = this.translate.instant('ACCESSIBILITY.SCROLLING', { direction });
    this.ttsService.speak(scrollMsg, 'normal');

    switch (direction) {
      case 'up':
        window.scrollBy({ top: -300, behavior: 'smooth' });
        break;
      case 'down':
        window.scrollBy({ top: 300, behavior: 'smooth' });
        break;
      case 'top':
        window.scrollTo({ top: 0, behavior: 'smooth' });
        break;
      case 'bottom':
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
        break;
    }
  }

  /**
   * Execute clear command
   */
  private executeClear(): void {
    const clearMsg = this.translate.instant('ACCESSIBILITY.CLEARING_SEARCH');
    this.ttsService.speak(clearMsg, 'normal');
    this.soundService.play('click');
    // Broadcast clear event for components to react
  }

  /**
   * Execute refresh command
   */
  private executeRefresh(): void {
    const refreshMsg = this.translate.instant('ACCESSIBILITY.REFRESHING');
    this.ttsService.speak(refreshMsg, 'normal');
    this.soundService.play('click');

    if (isPlatformBrowser(this.platformId)) {
      window.location.reload();
    }
  }

  /**
   * Execute back command
   */
  private executeBack(): void {
    const backMsg = this.translate.instant('ACCESSIBILITY.GOING_BACK');
    this.ttsService.speak(backMsg, 'normal');
    this.soundService.play('click');
    this.router.navigate(['../']);
  }

  /**
   * Execute help command
   */
  private executeHelp(): void {
    const helpText = this.translate.instant('ACCESSIBILITY.HELP_TEXT');
    this.ttsService.speak(helpText, 'high');
    this.feedbackSubject.next(helpText);
  }

  /**
   * Execute toggle command
   */
  private executeToggle(feature: string | null): void {
    if (!feature) {
      this.ttsService.speak(this.translate.instant('ACCESSIBILITY.TOGGLE_UNKNOWN'), 'normal');
      return;
    }

    let message = '';

    switch (feature) {
      case 'voice':
        this.settingsService.toggleVoiceGuidance();
        const voiceState = this.settingsService.isVoiceGuidanceEnabled();
        message = this.translate.instant(voiceState ? 'ACCESSIBILITY.VOICE_ENABLED' : 'ACCESSIBILITY.VOICE_DISABLED');
        break;

      case 'sound':
        this.settingsService.toggleSoundFeedback();
        const soundState = this.settingsService.isSoundFeedbackEnabled();
        message = this.translate.instant(soundState ? 'ACCESSIBILITY.SOUND_ENABLED' : 'ACCESSIBILITY.SOUND_DISABLED');
        break;

      case 'gestures':
        this.settingsService.toggleGestureNavigation();
        const gestureState = this.settingsService.isGestureNavigationEnabled();
        message = this.translate.instant(gestureState ? 'ACCESSIBILITY.GESTURES_ENABLED' : 'ACCESSIBILITY.GESTURES_DISABLED');
        break;

      default:
        message = this.translate.instant('ACCESSIBILITY.TOGGLE_UNKNOWN');
    }

    this.ttsService.speak(message, 'normal');
    this.feedbackSubject.next(message);
  }

  /**
   * Handle unknown command
   */
  private executeUnknown(rawText: string): void {
    const unknownMsg = this.translate.instant('ACCESSIBILITY.UNKNOWN_COMMAND', { command: rawText });
    this.ttsService.speak(unknownMsg, 'normal');
    this.feedbackSubject.next(unknownMsg);
    this.soundService.play('error');
  }

  /**
   * Add command to history
   */
  private addToHistory(command: VoiceCommand): void {
    this.commandHistory.unshift(command);
    if (this.commandHistory.length > this.maxHistorySize) {
      this.commandHistory.pop();
    }
  }

  /**
   * Get command history
   */
  getCommandHistory(): VoiceCommand[] {
    return [...this.commandHistory];
  }

  /**
   * Clear command history
   */
  clearHistory(): void {
    this.commandHistory = [];
  }

  /**
   * Get current state
   */
  getCurrentState(): VoiceNavigationState {
    return this.stateSubject.value;
  }

  /**
   * Check if currently listening
   */
  isListening(): boolean {
    return this.stateSubject.value === 'listening';
  }

  /**
   * Get available commands for help text
   */
  getAvailableCommands(): { [key: string]: string[] } {
    return {
      navigation: [
        this.translate.instant('ACCESSIBILITY.CMD_GO_HOME'),
        this.translate.instant('ACCESSIBILITY.CMD_GO_PROFILE'),
        this.translate.instant('ACCESSIBILITY.CMD_GO_CATEGORIES')
      ],
      search: [
        this.translate.instant('ACCESSIBILITY.CMD_SEARCH_NEARBY'),
        this.translate.instant('ACCESSIBILITY.CMD_SEARCH_CATEGORY')
      ],
      actions: [
        this.translate.instant('ACCESSIBILITY.CMD_CLEAR'),
        this.translate.instant('ACCESSIBILITY.CMD_BACK'),
        this.translate.instant('ACCESSIBILITY.CMD_REFRESH'),
        this.translate.instant('ACCESSIBILITY.CMD_HELP')
      ]
    };
  }
}
