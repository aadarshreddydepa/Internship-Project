import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BusinessLocationService {

  private baseUrl = 'http://localhost:5138/api/location'; // your backend

  constructor(private http: HttpClient) {}

  getCountries(): Observable<any> {
    return this.http.get(`${this.baseUrl}/countries`);
  }

  getStates(countryCode: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/states/${countryCode}`);
  }

  getCities(countryCode: string, stateCode: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/cities/${countryCode}/${stateCode}`);
  }
}