import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

export interface BusinessDto {
  id: number;
  name: string;
  description: string;
  categoryName: string;
  subcategoryName: string;

  phoneNumber?: string;
  email?: string;

  city?: string;
  state?: string;
  status?: string;

  primaryImage?: string;
  subcategoryId: number;
  latitude?: number;
  longitude?: number;
  distance?: number; // Distance from user in km
}

export interface VoiceSearchRequest {
  query: string;
  openNow: boolean;
  radius: number;
  category?: string;
}

export interface VoiceSearchResponse {
  success: boolean;
  message: string;
  results: BusinessDto[];
  totalCount: number;
  appliedFilters: {
    query: string;
    openNow: boolean;
    radiusKm: number;
    category?: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class SearchService {

  private baseUrl = 'http://localhost:5138/api/v1/business'; 
  private userLocation: { lat: number; lng: number } | null = null;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    if (isPlatformBrowser(this.platformId)) {
      this.getUserLocation();
    }
  }

  private getUserLocation(): void {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
        },
        (error) => {
          console.warn('Location error:', error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    }
  }

  private getLocationHeaders(): HttpHeaders {
    let headers = new HttpHeaders();
    if (this.userLocation) {
      headers = headers.set('X-User-Latitude', this.userLocation.lat.toString());
      headers = headers.set('X-User-Longitude', this.userLocation.lng.toString());
    }
    return headers;
  }

  searchBusinesses(query: string): Observable<BusinessDto[]> {
    return this.http.get<BusinessDto[]>(
      `${this.baseUrl}/search?query=${query}`,
      { headers: this.getLocationHeaders() }
    );
  }

  voiceSearch(request: VoiceSearchRequest): Observable<VoiceSearchResponse> {
    return this.http.post<VoiceSearchResponse>(
      `${this.baseUrl}/voice`,
      request,
      { headers: this.getLocationHeaders() }
    );
  }

  getBusinessById(id: number): Observable<BusinessDto> {
    return this.http.get<BusinessDto>(
      `${this.baseUrl}/v1/businesses/${id}`
    );
  }

  getBusinessesBySubcategory(subcategoryId: number): Observable<BusinessDto[]> {
    return this.http.get<BusinessDto[]>(
      `${this.baseUrl}/subcategories/${subcategoryId}/businesses`
    );
  }
}