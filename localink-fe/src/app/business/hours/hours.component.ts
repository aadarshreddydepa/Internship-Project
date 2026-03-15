import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EventEmitter, Output, Input } from '@angular/core';

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
  imports: [CommonModule, FormsModule],
  templateUrl: './hours.component.html',
  styleUrls: ['./hours.component.css']
})
export class HoursComponent {

  @Output() hoursSaved = new EventEmitter<any>();
  @Input() initialHours: any;

  ngOnInit() {

      if (this.initialHours && this.initialHours.length) {
        this.days.forEach(day => {
          const saved = this.initialHours.find((d: { day: string; }) => d.day === day.name);
          if (saved) {
            day.mode = saved.mode;
            day.slots = saved.slots || [];
          }
        });
      }
    }
    
  days: DaySchedule[] = [
    { name: 'Monday', selected: false, mode: 'custom', slots: [] },
    { name: 'Tuesday', selected: false, mode: 'custom', slots: [] },
    { name: 'Wednesday', selected: false, mode: 'custom', slots: [] },
    { name: 'Thursday', selected: false, mode: 'custom', slots: [] },
    { name: 'Friday', selected: false, mode: 'custom', slots: [] },
    { name: 'Saturday', selected: false, mode: 'custom', slots: [] },
    { name: 'Sunday', selected: false, mode: 'custom', slots: [] }
  ];

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
      alert("Time slots cannot overlap");
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

    const result = this.days.map(d => ({
      day: d.name,
      mode: d.mode,
      slots: d.slots
    }));

    console.log("Saved Business Hours:", result);
    this.hoursSaved.emit(result);
    this.successMessage = "Business hours saved successfully!";
    setTimeout(() => {
      this.successMessage = '';
    }, 3000);
  }

}