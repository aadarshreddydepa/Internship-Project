import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EventEmitter, Output, Input } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

interface TimeSlot {
  open: string;
  close: string;
}

type Mode = 'custom' | '24h' | 'closed';

interface DaySchedule {
  name: string;
  selected: boolean;
  mode: Mode;
  slots: TimeSlot[];
}

@Component({
  selector: 'app-hours',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './hours.component.html',
  styleUrls: ['./hours.component.css']
})
export class HoursComponent {
  private translate = inject(TranslateService);

  @Input() initialHours: any[] = [];                  
  @Output() hoursSaved = new EventEmitter<any[]>();
  ngOnInit() {

      if (this.initialHours && this.initialHours.length) {
        this.days.forEach(day => {
          const saved = this.initialHours.find((d: { dayOfWeek: string; }) => d.dayOfWeek === day.name);
          if (saved) {
            day.mode = saved.mode;
            day.slots = saved.slots || [];
          }
        });
      }
    }
   
  days: DaySchedule[] = [
    { name: 'MONDAY', selected: false, mode: 'custom', slots: [] },
    { name: 'TUESDAY', selected: false, mode: 'custom', slots: [] },
    { name: 'WEDNESDAY', selected: false, mode: 'custom', slots: [] },
    { name: 'THURSDAY', selected: false, mode: 'custom', slots: [] },
    { name: 'FRIDAY', selected: false, mode: 'custom', slots: [] },
    { name: 'SATURDAY', selected: false, mode: 'custom', slots: [] },
    { name: 'SUNDAY', selected: false, mode: 'custom', slots: [] }
  ];

  errorMessage = '';
  successMessage = '';

  showConfig = false;

 
  mode: Mode = 'custom';
 
  configSlots: TimeSlot[] = [
    { open: '09:00', close: '17:00' }
  ];
 
  get selectedDays() {
    return this.days.filter(d => d.selected);
  }
 
  selectAll() {
    this.days.forEach(d => d.selected = true);
  }
 
  clearSelection() {
    this.days.forEach(d => d.selected = false);
    this.showConfig = false;
  }
 
  openConfig() {

    const selected = this.selectedDays;

    if (!selected.length) return;

    /* Load existing slots when editing single day */

    if (selected.length === 1) {

      const day = selected[0];

      this.mode = day.mode;

      if (day.mode === 'custom' && day.slots.length) {
        this.configSlots = day.slots.map(s => ({ ...s }));
      } else {
        this.configSlots = [{ open: '09:00', close: '17:00' }];
      }

    }

    this.showConfig = true;
  }
 
  addSlot() {
    if (this.configSlots.length < 2) {
      this.configSlots.push({ open: '09:00', close: '17:00' });
    }
  }
 
  removeSlot(i: number) {
    this.configSlots.splice(i, 1);
  }
 
  cancelConfig() {
    this.showConfig = false;
  }
 
  hasOverlap(): boolean {

    if (this.configSlots.length < 2) return false;

    const [a, b] = this.configSlots;

    return !(a.close <= b.open || b.close <= a.open);
  }
 
  applyHours() {

    if (this.mode === 'custom' && this.hasOverlap()) {
      alert(this.translate.instant('HOURS.OVERLAP_ERROR'));
      return;
    }

    this.selectedDays.forEach(day => {

      day.mode = this.mode;

      if (this.mode === 'custom') {
        day.slots = this.configSlots.map(s => ({ ...s }));
      } else {
        day.slots = [];
      }

    });

    this.days.forEach(d => d.selected = false);

    this.configSlots = [{ open: '09:00', close: '17:00' }];
    this.mode = 'custom';

    this.showConfig = false;
  }
 
  saveBusinessHours() {
      const incompleteDays = this.days.filter(d =>
        d.mode === 'custom' && d.slots.length === 0
      );
      if (incompleteDays.length > 0) {
        this.errorMessage = this.translate.instant('VALIDATION.FILL_REQUIRED');
        return;
      }
      this.errorMessage = '';
      const result = this.days.map(d => ({
        dayOfWeek: d.name,
        mode: d.mode,
        slots: d.slots
      }));
      console.log("Saved Business Hours:", result);
      this.hoursSaved.emit(result);
      this.successMessage = this.translate.instant('HOURS.SAVED_SUCCESS');
      setTimeout(() => {
        this.successMessage = '';
      }, 3000);
    }
}