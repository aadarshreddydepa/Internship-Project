import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SubcategoryService {

  private dataUrl = '/data/subcategories.json';

  constructor(private http: HttpClient) {}

  getSubcategories(): Observable<any> {
    return this.http.get<any>(this.dataUrl);
  }

}