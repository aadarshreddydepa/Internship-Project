import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
 
@Injectable({
  providedIn: 'root'
})
export class BusinessService {
 
  private apiUrl = 'http://localhost:5104/business';
 
  constructor(private http: HttpClient) {}
 
  registerBusiness(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, data);
  }
}