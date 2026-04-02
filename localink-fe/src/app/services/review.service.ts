import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ReviewService {

  private baseUrl = 'http://localhost:5145/api/v1/reviews';

  constructor(private http: HttpClient) {}

  addReview(data: any) {
    return this.http.post(this.baseUrl, data);
  }

  getReviews(businessId: number) {
    return this.http.get(`${this.baseUrl}/business/${businessId}`);
  }

  getSummary(businessId: number) {
    return this.http.get(`${this.baseUrl}/summary/${businessId}`);
  }

  getAiSuggestions(keywords: string) {
  return this.http.get<string[]>(`http://localhost:5145/api/ai/suggestions?keywords=${encodeURIComponent(keywords)}`);
  }
}
