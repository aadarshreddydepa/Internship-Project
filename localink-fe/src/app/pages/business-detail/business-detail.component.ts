import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { BusinessListService } from '../../services/business-list.service';
import { ReviewService } from '../../services/review.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-business-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './business-detail.component.html',
  styleUrls:['./business-detail.component.css']
})
export class BusinessDetailComponent implements OnInit {

  business: any;
  categoryName = '';
  subcategoryName = '';
  categoryId!: number;
  reviews: any[] = [];
  averageRating = 0;
  totalReviews = 0;
  rating = 0;
  hoverRating = 0;
  showReviewForm = false;
  showAllReviews = false;
  comment = '';
  enableAiSuggestions = false;
  aiSuggestions: string[] = [];
  typingTimer: any;

  constructor(
    private route: ActivatedRoute,
    private businessService: BusinessListService,
    private reviewService: ReviewService
  ) {}

subcategoryId!: number;

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loadReviews(id);
      this.categoryName =
        this.route.snapshot.queryParamMap.get('categoryName') || '';
      this.subcategoryName =
        this.route.snapshot.queryParamMap.get('subcategoryName') || '';
      this.subcategoryId = Number(
        this.route.snapshot.queryParamMap.get('subcategoryId')
      );
      this.categoryId = Number(
        this.route.snapshot.queryParamMap.get('categoryId')
      );
      this.businessService.getBusinessById(id).subscribe({
        next: (data: any) => {
          const primaryPhoto = data.photos?.find((p: any) => p.isPrimary);
          this.business = {
            ...data,
            primaryImage: primaryPhoto
              ? 'http://localhost:5138' + primaryPhoto.imageUrl
              : null
          };
        },
        error: () => {
          // Fallback MOCK DATA since there is no local database
          this.business = {
            businessId: 1,
            businessName: "[MOCK] Awesome Coffee Shop",
            description: "A wonderful place to grab coffee, work, and relax. Friendly staff and fast WiFi! (This is mock data loaded because your local database is unavailable).",
            primaryImage: null,
            contact: {
              phoneNumber: "555-0199",
              email: "hello@awesomecoffee.test",
              city: "Seattle",
              state: "WA"
            }
          };
        }
      });
    }

    loadReviews(businessId: number) {
    this.reviewService.getReviews(businessId).subscribe({
      next: (data: any) => {
        this.reviews = data;
      },
      error: () => {
        // Fallback MOCK REVIEWS
        this.reviews = [
          { userName: "Alice", rating: 5, comment: "I loved this place! Totally recommend it." },
          { userName: "Bob", rating: 4, comment: "Great vibe, but it was a bit crowded." }
        ];
      }
    });

    this.reviewService.getSummary(businessId).subscribe({
      next: (data: any) => {
        this.averageRating = data.averageRating;
        this.totalReviews = data.totalReviews;
      },
      error: () => {
        // Fallback MOCK SUMMARY
        this.averageRating = 4.5;
        this.totalReviews = 2;
      }
    });
  }
  
  setRating(value: number) {
    this.rating = value;
  }

  setHover(value: number) {
    this.hoverRating = value;
  }

  clearHover() {
    this.hoverRating = 0;
  }

  submitReview() {
    if (this.rating < 1) {
      alert('Please select a rating');
      return;
    }

    const payload = {
      businessId: this.business.businessId,
      rating: this.rating,
      comment: this.comment
    };

    this.reviewService.addReview(payload).subscribe({
      next: () => {
        this.comment = '';
        this.rating = 0;
        this.aiSuggestions = [];
        this.loadReviews(this.business.businessId);
      },
      error: () => {
        alert('Failed to submit review');
      }
    });
  }

  onCommentChange() {
    if (!this.enableAiSuggestions || !this.comment || this.comment.trim().length < 3) {
      this.aiSuggestions = [];
      return;
    }

    // Debounce typing to fetch suggestions
    clearTimeout(this.typingTimer);
    this.typingTimer = setTimeout(() => {
      this.fetchAiSuggestions(this.comment);
    }, 1000);
  }

  fetchAiSuggestions(keywords: string) {
    this.reviewService.getAiSuggestions(keywords).subscribe({
      next: (suggestions: string[]) => {
        this.aiSuggestions = suggestions;
      },
      error: (err: any) => {
        console.error('Failed to fetch AI suggestions', err);
        // Optional: silently fail or clear suggestions
        this.aiSuggestions = [];
      }
    });
  }

  appendSuggestion(suggestion: string) {
    const currentComment = this.comment.trim();
    if (currentComment) {
      this.comment = currentComment + ' ' + suggestion;
    } else {
      this.comment = suggestion;
    }
    this.aiSuggestions = []; // optional: hide after use
  }

  get visibleReviews() {
    return this.showAllReviews ? this.reviews : this.reviews.slice(0, 6);
  }
  toggleReviewForm() {
    this.showReviewForm = !this.showReviewForm;
  }

  toggleViewMore() {
    this.showAllReviews = !this.showAllReviews;
  }
}