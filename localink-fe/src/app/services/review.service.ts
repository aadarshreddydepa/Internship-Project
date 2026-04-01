import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ReviewService {

  private baseUrl = 'http://localhost:5138/api/v1/reviews';

  constructor(private http: HttpClient) {}

  private getHeaders() {
    const token = localStorage.getItem('token');

    return {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`
      })
    };
  }

  addReview(data: any) {
    return this.http.post(this.baseUrl, data, this.getHeaders());
  }

  getReviews(businessId: number) {
    return this.http.get(`${this.baseUrl}/business/${businessId}`);
  }

  getSummary(businessId: number) {
    return this.http.get(`${this.baseUrl}/summary/${businessId}`);
  }

  getAiSuggestions(keywords: string) {
    return this.http.get<string[]>(`http://localhost:5138/api/ai/suggestions?keywords=${encodeURIComponent(keywords)}`);
  }
}
