import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
 
export interface BusinessDto {
  id: number;
  name: string;
  categoryName: string;
  subcategoryName: string;
  status: string;
  description?: string;
  phoneNumber?: string;
  email?: string;
  city?: string;
}
 
@Injectable({
  providedIn: 'root'
})
export class ClientDashboardService {
  private cscBaseUrl = 'https://api.countrystatecity.in/v1';
  private geoapifyKey = 'b5574329b50a49f49fe3b9ebbaf7a837';
private apiKey = '09d662e834863a5122847c45ada89c6984c7cbbe7889d17e25008528efbf139f'; // 🔴 put your key here

private headers = {
  'X-CSCAPI-KEY': this.apiKey
};
 
  private baseUrl = 'http://localhost:5138/api/v1/business';
 
  constructor(private http: HttpClient) {}
 
  getBusinessesByUser(): Observable<BusinessDto[]> {
     return this.http.get<BusinessDto[]>(`${this.baseUrl}/my-businesses`);
  }
  getUserProfile() {
    return this.http.get<any>(`http://localhost:5138/api/v1/user/profile`);
  }
  getCategories() {
    return this.http.get<any[]>('http://localhost:5138/api/v1/categories');
  }

  getSubcategories(categoryId: number) {
    return this.http.get<any[]>(`http://localhost:5138/api/v1/categories/${categoryId}/subcategories`);
  }
  updateBusiness(id: number, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}`, data);
  }
  getBusinessById(id: number) {
  return this.http.get(`http://localhost:5138/api/v1/business/${id}`);
}
 
// GET PHOTOS
getPhotos(businessId: number) {
  return this.http.get<any[]>(`http://localhost:5138/api/v1/business/${businessId}/photos`);
}
 
// UPLOAD PHOTO
uploadPhoto(businessId: number, file: File) {
  const formData = new FormData();
  formData.append('file', file);
 
  return this.http.post(`http://localhost:5138/api/v1/business/${businessId}/photos`, formData);
}
 
// DELETE PHOTO
deletePhoto(photoId: number) {
  return this.http.delete(`http://localhost:5138/api/v1/photos/${photoId}`);
}
}
 
 