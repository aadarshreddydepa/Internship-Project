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


  validateWeeklyHours(hours: any): { valid: boolean, message: string } {

    const days = [
      'Monday','Tuesday','Wednesday',
      'Thursday','Friday','Saturday','Sunday'
    ];

    for (const day of days) {

      const data = hours[day];

      if (!data) {
        return {
          valid: false,
          message: `${day} hours are missing`
        };
      }

      if (data.closed) {
        continue;
      }

      if (!data.slots || data.slots.length === 0) {
        return {
          valid: false,
          message: `Please add business hours for ${day}`
        };
      }

      for (const slot of data.slots) {

        if (!slot.open || !slot.close) {
          return {
            valid: false,
            message: `${day}: Open and Close time are required`
          };
        }

        if (slot.open >= slot.close) {
          return {
            valid: false,
            message: `${day}: Open time must be earlier than close time`
          };
        }

      }

    }

    return {
      valid: true,
      message: ''
    };

  }

}