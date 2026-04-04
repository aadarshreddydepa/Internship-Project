import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { BusinessListService } from '../../services/business-list.service';
import { ReviewService } from '../../services/review.service';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-business-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, TranslateModule],
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
  aiSuggestions: string[] = [];
  isLoadingAiSuggestions = false;
  showAiSuggestions = false;
  aiReviewSummary: string | null = null;
  isLoadingAiSummary = false;
  aiSummaryError: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private businessService: BusinessListService,
    private reviewService: ReviewService,
    @Inject(PLATFORM_ID) private platformId: Object
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
          // Fallback: Use category/subcategory from business data if query params were empty
          if (!this.categoryName && data.categoryName) {
            this.categoryName = data.categoryName;
          }
          if (!this.categoryName && data.category?.categoryName) {
            this.categoryName = data.category.categoryName;
          }
          if (!this.subcategoryName && data.subcategoryName) {
            this.subcategoryName = data.subcategoryName;
          }
          if (!this.subcategoryName && data.subcategory?.subcategoryName) {
            this.subcategoryName = data.subcategory.subcategoryName;
          }
          if ((!this.categoryId || this.categoryId === 0) && data.categoryId) {
            this.categoryId = data.categoryId;
          }
          if ((!this.subcategoryId || this.subcategoryId === 0) && data.subcategoryId) {
            this.subcategoryId = data.subcategoryId;
          }
        }
      });
    }

    loadReviews(businessId: number) {
    this.reviewService.getReviews(businessId).subscribe((data: any) => {
      this.reviews = data;
    });

    this.reviewService.getSummary(businessId).subscribe((data: any) => {
      this.averageRating = data.averageRating;
      this.totalReviews = data.totalReviews;
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
        this.loadReviews(this.business.businessId);
      },
      error: () => {
        alert('Failed to submit review');
      }
    });
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

  getDirections() {
    if (!isPlatformBrowser(this.platformId)) return;

    const lat = this.business?.contact?.latitude;
    const lng = this.business?.contact?.longitude;

    if (lat && lng) {
      // Open Google Maps directions from user's current location to business
      const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
      window.open(url, '_blank');
    } else {
      // Fallback: use address text if no coordinates
      const addr = [
        this.business?.contact?.streetAddress,
        this.business?.contact?.city,
        this.business?.contact?.state,
        this.business?.contact?.country
      ].filter(Boolean).join(', ');

      if (addr) {
        const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(addr)}`;
        window.open(url, '_blank');
      } else {
        alert('Location data is not available for this business.');
      }
    }
  }

  contactBusiness() {
    if (!this.business?.contact) {
      alert('Contact information not available.');
      return;
    }
    const phone = this.business.contact.phoneNumber;
    if (phone) {
      window.open(`tel:${phone}`, '_self');
    } else {
      const email = this.business.contact.email;
      if (email) {
        window.open(`mailto:${email}`, '_self');
      }
    }
  }

  getAiSuggestions() {
    if (!this.comment || this.comment.trim().length < 3) {
      alert('Please write at least a few words first');
      return;
    }
    if (this.rating < 1) {
      alert('Please select a rating first');
      return;
    }

    this.isLoadingAiSuggestions = true;
    this.showAiSuggestions = false;

    this.reviewService.getReviewSuggestions(
      this.comment,
      this.rating,
      this.business?.businessName || 'this business'
    ).subscribe({
      next: (response: any) => {
        this.aiSuggestions = response.data || [];
        this.showAiSuggestions = this.aiSuggestions.length > 0;
        this.isLoadingAiSuggestions = false;
      },
      error: () => {
        alert('Failed to get AI suggestions');
        this.isLoadingAiSuggestions = false;
      }
    });
  }

  applySuggestion(suggestion: string) {
    this.comment = suggestion;
    this.showAiSuggestions = false;
  }

  generateReviewSummary() {
    if (this.reviews.length === 0) {
      this.aiSummaryError = 'No reviews available to summarize';
      return;
    }

    this.isLoadingAiSummary = true;
    this.aiSummaryError = null;

    const reviewComments = this.reviews
      .filter(r => r.comment && r.comment.trim().length > 0)
      .map(r => r.comment);

    if (reviewComments.length === 0) {
      this.aiSummaryError = 'No review comments available to summarize';
      this.isLoadingAiSummary = false;
      return;
    }

    this.reviewService.getReviewSummary(
      reviewComments,
      this.averageRating,
      this.totalReviews,
      this.business?.businessName || 'this business'
    ).subscribe({
      next: (response: any) => {
        this.aiReviewSummary = response.data;
        this.isLoadingAiSummary = false;
      },
      error: () => {
        this.aiSummaryError = 'Failed to generate review summary';
        this.isLoadingAiSummary = false;
      }
    });
  }
}