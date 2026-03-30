import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface UserProfile {
  userId: number;
  fullName: string;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
    pincode: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private baseUrl = 'http://localhost:5138/api/v1/user';

  constructor(private http: HttpClient) {}

  getUserProfile(userId: number): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.baseUrl}/profile/${userId}`);
  }
}