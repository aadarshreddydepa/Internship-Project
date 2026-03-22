import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
 
@Injectable({
  providedIn: 'root'
})
export class AuthService {
 
  private baseUrl = 'http://localhost:5085/api/v1';
 
  constructor(private http: HttpClient) {}
 
  // LOGIN
  login(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/sessions`, data);
  }
 
  // REGISTER
  register(data: any) {
    return this.http.post(`${this.baseUrl}/users`, data);
  }
 
  // VERIFY EMAIL (UPDATED → GET with query param)
  verifyEmail(email: string) {
    return this.http.get(
      `${this.baseUrl}/users/email?value=${email}`
    );
  }
 
  // RESET PASSWORD (UPDATED → PUT)
  resetPassword(data: any) {
    return this.http.put(`${this.baseUrl}/users/password`, data);
  }
}
