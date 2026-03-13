import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BusinessHoursService } from '../../services/business-hours.service';

interface TimeSlot {
  open: string;
  close: string;
}

@Component({
  selector: 'app-hours',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './hours.component.html',
  styleUrls: ['./hours.component.css']
})
export class HoursComponent implements OnInit {

  constructor(private hoursService: BusinessHoursService) {}

  days = [
    'Monday','Tuesday','Wednesday',
    'Thursday','Friday','Saturday','Sunday'
  ];

  selectedDay = 'Monday';

  errorMessage = '';

  timeSlots: TimeSlot[] = [
    { open:'', close:'' }
  ];

  businessHours:any = {
    Monday:{ closed:false, slots:[] },
    Tuesday:{ closed:false, slots:[] },
    Wednesday:{ closed:false, slots:[] },
    Thursday:{ closed:false, slots:[] },
    Friday:{ closed:false, slots:[] },
    Saturday:{ closed:false, slots:[] },
    Sunday:{ closed:false, slots:[] }
  };

  ngOnInit(){

    const stored = this.hoursService.getHours();

    if(stored){
      this.businessHours = stored;
    }

  }

  selectDay(day:string){

    // Save current day slots
    if(!this.businessHours[this.selectedDay].closed){
      this.businessHours[this.selectedDay].slots =
        this.timeSlots.map(s => ({...s}));
    }

    this.selectedDay = day;

    const data = this.businessHours[day];

    if(data.closed){
      this.timeSlots = [];
    }
    else{

      this.timeSlots = data.slots.length
        ? data.slots.map((s:any)=>({open:s.open,close:s.close}))
        : [{open:'',close:''}];

    }

    this.errorMessage = '';

  }

  addSlot(){

    if(this.businessHours[this.selectedDay].closed) return;

    this.timeSlots.push({open:'',close:''});

  }

  removeSlot(index:number){

    if(this.businessHours[this.selectedDay].closed) return;

    this.timeSlots.splice(index,1);

    if(this.timeSlots.length === 0){
      this.timeSlots.push({open:'',close:''});
    }

  }

  toggleClosed(day:string){

    this.businessHours[day].closed =
      !this.businessHours[day].closed;

    if(this.businessHours[day].closed){

      this.businessHours[day].slots = [];
      this.timeSlots = [];

    }
    else{

      this.timeSlots = [{open:'',close:''}];

    }

    this.errorMessage = '';

  }

  applyWeekdays(){

    const mondaySlots = this.businessHours['Monday'].slots;

    ['Tuesday','Wednesday','Thursday','Friday']
      .forEach(day => {

        if(!this.businessHours[day].closed){

          this.businessHours[day].slots =
            mondaySlots.map((slot:any)=>({
              open: slot.open,
              close: slot.close
            }));

        }

      });

  }

  validateSlots(slots:TimeSlot[]):boolean{

    if(this.businessHours[this.selectedDay].closed){
      return true;
    }

    this.errorMessage='';

    for(const slot of slots){

      if(!slot.open && !slot.close){
        this.errorMessage='Open and Close hours are required.';
        return false;
      }

      if(!slot.open){
        this.errorMessage='Open time is required.';
        return false;
      }

      if(!slot.close){
        this.errorMessage='Close time is required.';
        return false;
      }

      if(slot.open >= slot.close){
        this.errorMessage='Open time must be earlier than close time.';
        return false;
      }

    }

    return true;

  }

  submitHours(){

    if(!this.validateSlots(this.timeSlots)) return;

    if(!this.businessHours[this.selectedDay].closed){

      this.businessHours[this.selectedDay].slots =
        this.timeSlots.map(s=>({...s}));

    }

    this.hoursService.setHours(this.businessHours);

    console.log(
      'Saved Hours:',
      JSON.stringify(this.businessHours,null,2)
    );

  }
  /** For showing ✔ tick mark in UI */
  hasHours(day:string){

    return !this.businessHours[day].closed &&
           this.businessHours[day].slots.length > 0;

  }

}