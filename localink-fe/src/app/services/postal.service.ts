import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PostalService {

  private baseUrl = '/api/postal';

  constructor(private http: HttpClient) {}

  validate(postcode: string, country: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/validate`, {
      params: { postcode, country }
    });
  }
}