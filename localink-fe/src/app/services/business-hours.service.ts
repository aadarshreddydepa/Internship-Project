import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class BusinessHoursService {

  private storageKey = 'businessHours';

  setHours(data: any) {
    localStorage.setItem(this.storageKey, JSON.stringify(data));
  }

  getHours() {
    const stored = localStorage.getItem(this.storageKey);
    return stored ? JSON.parse(stored) : null;
  }

}