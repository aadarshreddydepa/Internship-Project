import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, switchMap, filter } from 'rxjs';

import { CategoryService, Category } from '../../services/category.service';
import { PopularBusinessesComponent } from '../../popular-businesses/popular-businesses.component';
import { ProfileComponent } from '../../pages/profile/profile.component';
import { UserProfile, UserService } from '../../services/user.service';
import { SearchService, BusinessDto } from '../../services/search.service';
import { VoiceSearchComponent } from '../../components/voice-search/voice-search.component';
import { VoiceSearchResult } from '../../services/voice.service';
import { TtsService } from '../../services/tts.service';
import { SoundService } from '../../services/sound.service';
import { TranslateModule } from '@ngx-translate/core';
import { ScreenReaderService } from '../../services/screen-reader.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, FormsModule, PopularBusinessesComponent, ProfileComponent, TranslateModule, VoiceSearchComponent],
  templateUrl: './user-dashboard.component.html',
  styleUrl: './user-dashboard.component.css'
})
export class UserDashboardComponent implements OnInit {

  categories: Category[] = [];
  username: string = '';
  searchTerm: string = '';

  searchResults: BusinessDto[] = [];
  private searchSubject = new Subject<string>();

  showProfile = false;
  isVoiceSearchEnabled = true;

  constructor(
    private categoryService: CategoryService,
    private userService: UserService,
    private businessService: SearchService,
    private ttsService: TtsService,
    private soundService: SoundService,
    private screenReader: ScreenReaderService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.loadCategories();
    this.loadUser();

    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      filter((query: string) => query.trim().length > 3),
      switchMap(query => {
        this.screenReader.announceLoading('Searching');
        return this.businessService.searchBusinesses(query);
      })
    ).subscribe({
      next: (data) => {
        this.searchResults = data;
        this.screenReader.announceSearchResults(data.length, this.searchTerm);
      },
      error: (err) => {
        console.error(err);
        this.screenReader.announceError('Search failed. Please try again.');
      }
    });
  }

  onSearchChange(value: string) {
    this.searchTerm = value;

    const trimmed = value?.trim();

    if (!trimmed) {
      this.searchResults = []; 
      return;
    }

    this.searchSubject.next(trimmed);
  }

  loadUser() {
    this.userService.getUserProfile().subscribe({
      next: (data: UserProfile) => {
        this.username = data.fullName;
      },
      error: (err) => {
        console.error('Error fetching user', err);
      }
    });
  }

  loadCategories(): void {
    this.categoryService.getCategories().subscribe({
      next: (data) => {
        this.categories = data;
      },
      error: (err) => {
        console.error('Error fetching categories', err);
      }
    });
  }

  get filteredCategories(): Category[] {
    return this.categories;
  }

  toggleProfile(): void {
    this.showProfile = true;
    this.screenReader.announce('Profile panel opened', 'polite');
  }

  closeProfile(): void {
    this.showProfile = false;
    this.screenReader.announce('Profile panel closed', 'polite');
  }

  onCategoryKeydown(event: KeyboardEvent, categoryId: number, categoryName: string): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.screenReader.announce(`Opening ${categoryName} category`, 'polite');
      this.openCategory(categoryId);
    }
  }

  focusSearch(): void {
    const searchInput = document.querySelector('.search-input-wrapper input') as HTMLElement;
    if (searchInput) {
      searchInput.focus();
      this.screenReader.announce('Search box focused. Type to search or press the voice button to search by voice.', 'polite');
    }
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  openCategory(categoryId: number): void {
    window.location.href = `/subcategory/${categoryId}`;
  }

  // Voice search handlers - improved for real-time search
  onVoiceSearch(result: VoiceSearchResult): void {
    // Update search term with the recognized query
    this.searchTerm = result.query;
    
    // Perform search immediately with voice result
    if (result.query.trim().length > 0) {
      this.performSearch(result.query, result.category);
    }
    
    // Handle category navigation if specified and no specific query
    if (result.category && !result.query.trim()) {
      this.handleCategoryVoiceSearch(result.category);
    }
  }

  private performSearch(query: string, category?: string): void {
    this.businessService.searchBusinesses(query).subscribe({
      next: (data) => {
        this.searchResults = data;
        
        // If we have a category hint, prioritize results from that category
        if (category && data.length > 0) {
          const categoryResults = data.filter(b => 
            b.categoryName?.toLowerCase().includes(category.toLowerCase())
          );
          if (categoryResults.length > 0) {
            this.searchResults = [...categoryResults, ...data.filter(b => !categoryResults.includes(b))];
          }
        }
        
        // Announce results via TTS and sound
        if (this.searchResults.length > 0) {
          this.ttsService.speak(`Found ${this.searchResults.length} results for ${query}`, 'normal');
          this.soundService.playSuccess();
          this.screenReader.announceSearchResults(this.searchResults.length, query);
        } else {
          this.ttsService.speak('No results found. Try a different search.', 'normal');
          this.soundService.play('notification');
          this.screenReader.announce('No results found for ' + query, 'polite');
        }
      },
      error: (err) => {
        console.error('Voice search error:', err);
        this.ttsService.announceError('Search failed. Please try again.');
        this.soundService.playError();
        this.screenReader.announceError('Search failed');
      }
    });
  }

  private handleCategoryVoiceSearch(categoryKeyword: string): void {
    // Find matching category from voice keyword
    const categoryMap: { [key: string]: string[] } = {
      'restaurant': ['Food', 'Restaurant', 'Dining'],
      'hospital': ['Medical', 'Hospital', 'Clinic'],
      'school': ['Education', 'School', 'College'],
      'shop': ['Shopping', 'Shop', 'Store', 'Retail'],
      'bank': ['Bank', 'Finance', 'ATM'],
      'repair': ['Repair', 'Service', 'Mechanic'],
      'tutoring': ['Tutoring', 'Education', 'Coaching'],
      'beauty': ['Beauty', 'Salon', 'Spa'],
      'automotive': ['Automotive', 'Car', 'Vehicle'],
      'electronics': ['Electronics', 'Mobile', 'Computer'],
      'fitness': ['Fitness', 'Gym', 'Sports'],
      'home services': ['Home', 'Cleaning', 'Services']
    };

    const possibleCategories = categoryMap[categoryKeyword.toLowerCase()] || [categoryKeyword];
    
    const matchingCategory = this.categories.find(c => 
      possibleCategories.some(pc => 
        c.name.toLowerCase().includes(pc.toLowerCase()) ||
        pc.toLowerCase().includes(c.name.toLowerCase())
      )
    );
    
    if (matchingCategory) {
      this.ttsService.speak(`Opening ${matchingCategory.name} category`, 'normal');
      this.screenReader.announce(`Opening ${matchingCategory.name} category`, 'polite');
      this.openCategory(matchingCategory.id);
    } else {
      // If no category match, search with the keyword as query
      this.performSearch(categoryKeyword);
    }
  }

  onVoiceTranscript(transcript: string): void {
    // Update the search input in real-time as user speaks
    this.searchTerm = transcript;
    
    // Auto-trigger search if transcript is substantial (4+ chars) and not just interim noise
    const trimmed = transcript.trim();
    if (trimmed.length >= 4) {
      // Use a small debounce to avoid excessive searches while speaking
      clearTimeout(this.voiceSearchDebounceTimeout);
      this.voiceSearchDebounceTimeout = setTimeout(() => {
        this.searchSubject.next(trimmed);
      }, 500);
    }
  }
  
  private voiceSearchDebounceTimeout: any = null;
}