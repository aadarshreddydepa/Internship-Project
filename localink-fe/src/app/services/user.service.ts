import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface UserProfile {
  data: UserProfile;
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

@Injectable({ providedIn: 'root' })
export class UserService {

  private baseUrl = 'http://localhost:5145/api/v1/user';

  constructor(private http: HttpClient) {}

  getUserProfile() {
    return this.http.get<UserProfile>(`${this.baseUrl}/profile`);
  }
}