import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-contact-us',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './contact-us.component.html',
  styleUrls: ['./contact-us.component.css']
})
export class ContactUsComponent {

  feedbackText = '';
  successMessage = '';
  userId: number | null = null;

  constructor(private http: HttpClient) {
    this.loadUserFromToken();
  }

  // 🔥 Extract userId from JWT
  loadUserFromToken() {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      this.userId = payload.userId || payload.id || null;
    } catch (e) {
      console.error('Invalid token');
    }
  }

  submitFeedback() {
    if (!this.feedbackText.trim()) return;

    const payload = {
      feedback: this.feedbackText,
      userId: this.userId
    };

    this.http.post('http://localhost:5138/api/feedback', payload)
      .subscribe({
        next: () => {
          this.successMessage = 'Feedback submitted successfully!';
          this.feedbackText = '';
        },
        error: (err) => console.error(err)
      });
  }
}