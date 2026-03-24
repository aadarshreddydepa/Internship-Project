import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
 
@Injectable({
  providedIn: 'root'
})
export class BusinessService {
 
  private apiUrl = 'http://localhost:5138/api/v1/business';
 
  constructor(private http: HttpClient) {}
 
  registerBusiness(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/register`, data);
  }
}