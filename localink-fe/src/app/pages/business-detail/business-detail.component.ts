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
}