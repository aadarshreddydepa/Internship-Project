import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private baseUrl = 'http://localhost:5085/api/auth';

  constructor(private http: HttpClient) {}

  login(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/login`, data);
  }
  register(data: any) {
  return this.http.post(`${this.baseUrl}/register`, data);
}
verifyEmail(email: string) {
  return this.http.post(
    'http://localhost:5085/api/auth/verify-email',
    { email: email } // 🔥 MUST BE OBJECT
  );
}

resetPassword(data: any) {
  return this.http.post('http://localhost:5085/api/auth/reset-password', data);
}
}