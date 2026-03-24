import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private baseUrl = 'http://localhost:5138/api/v1';

  constructor(private http: HttpClient) {}

  // REGISTER
  register(data: any) {
    return this.http.post(`${this.baseUrl}/auth/register`, data);
  }

  // LOGIN
  login(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/sessions`, data);
  }

  // OPTIONAL
  verifyEmail(email: string) {
    return this.http.get(`${this.baseUrl}/users/email?value=${email}`);
  }

  // RESET PASSWORD
  resetPassword(data: any) {
    return this.http.put(`${this.baseUrl}/users/password`, data);
  }
}