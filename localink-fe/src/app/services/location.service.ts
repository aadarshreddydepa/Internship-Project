import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LocationService {

  private baseUrl = '/api/location'; // proxy will handle backend URL

  constructor(private http: HttpClient) {}

  getCountries(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/countries`);
  }

  getStates(countryCode: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/states/${countryCode}`);
  }

  getCities(countryCode: string, stateCode: string): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.baseUrl}/cities/${countryCode}/${stateCode}`
    );
  }
}