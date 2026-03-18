import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HoursComponent } from './hours.component';
import { FormsModule } from '@angular/forms';

describe('HoursComponent', () => {

  let component: HoursComponent;
  let fixture: ComponentFixture<HoursComponent>;

  beforeEach(async () => {

    await TestBed.configureTestingModule({
      imports:[HoursComponent,FormsModule]
    }).compileComponents();

    fixture = TestBed.createComponent(HoursComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should add a new time slot', () => {

    const initial = component.timeSlots.length;

    component.addSlot();

    expect(component.timeSlots.length)
      .toBe(initial + 1);

  });

  it('should remove slot', () => {

    component.timeSlots=[
      {open:'09:00',close:'12:00'},
      {open:'13:00',close:'17:00'}
    ];

    component.removeSlot(0);

    expect(component.timeSlots.length)
      .toBe(1);

  });

  it('should detect invalid time range', () => {

    const slots=[
      {open:'18:00',close:'09:00'}
    ];

    const valid =
      component.validateSlots(slots);

    expect(valid).toBeFalse();

  });

  

  it('should validate correct slots', () => {

    const slots=[
      {open:'09:00',close:'12:00'},
      {open:'13:00',close:'17:00'}
    ];

    const valid =
      component.validateSlots(slots);

    expect(valid).toBeTrue();

  });

  it('should toggle closed day', () => {

    component.toggleClosed('Sunday');

    expect(
      component.businessHours['Sunday'].closed
    ).toBeTrue();

  });

  it('should copy monday hours to weekdays', () => {

    component.businessHours['Monday'].slots=[
      {open:'09:00',close:'17:00'}
    ];

    component.applyWeekdays();

    expect(
      component.businessHours['Tuesday'].slots.length
    ).toBe(1);

  });

});