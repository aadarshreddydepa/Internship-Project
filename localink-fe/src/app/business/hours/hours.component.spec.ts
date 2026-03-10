import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HoursComponent } from './hours.component';
import { ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';

describe('HoursComponent', () => {
  let component: HoursComponent;
  let fixture: ComponentFixture<HoursComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HoursComponent, ReactiveFormsModule]
    }).compileComponents();

    fixture = TestBed.createComponent(HoursComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  //  Component Creation Test
  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  //  Form Initialization Test
  it('should initialize the form with required controls', () => {
    const form = component.businessHoursForm;

    expect(form.contains('open24Hours')).toBeTrue();
    expect(form.contains('openTime')).toBeTrue();
    expect(form.contains('closeTime')).toBeTrue();
  });

  //  Required Validation Test
  it('should mark form invalid when open and close times are empty', () => {
    component.businessHoursForm.setValue({
      open24Hours: false,
      openTime: '',
      closeTime: ''
    });

    expect(component.businessHoursForm.invalid).toBeTrue();
  });

  //  Valid Time Range Test
  it('should mark form valid when open time is before close time', () => {

    component.businessHoursForm.setValue({
      open24Hours: false,
      openTime: '09:00',
      closeTime: '18:00'
    });

    expect(component.businessHoursForm.valid).toBeTrue();
  });

//  Invalid Time Range Test
  it('should return invalidTimeRange error when close time is earlier than open time', () => {

    component.businessHoursForm.setValue({
      open24Hours: false,
      openTime: '18:00',
      closeTime: '09:00'
    });

    expect(component.businessHoursForm.errors?.['invalidTimeRange']).toBeTrue();
  });

  //  24 Hours Checkbox Disables Time Fields
  it('should disable openTime and closeTime when open24Hours is selected', () => {

    component.businessHoursForm.get('open24Hours')?.setValue(true);
    fixture.detectChanges();

    expect(component.businessHoursForm.get('openTime')?.disabled).toBeTrue();
    expect(component.businessHoursForm.get('closeTime')?.disabled).toBeTrue();
  });

  // 24 Hours Checkbox Enables Time Fields Again
  it('should enable time inputs when open24Hours is unchecked', () => {

    component.businessHoursForm.get('open24Hours')?.setValue(true);
    component.businessHoursForm.get('open24Hours')?.setValue(false);

    fixture.detectChanges();

    expect(component.businessHoursForm.get('openTime')?.enabled).toBeTrue();
    expect(component.businessHoursForm.get('closeTime')?.enabled).toBeTrue();
  });

  // Time Inputs Hidden When 24 Hours Checked
  it('should hide time inputs when open24Hours is true', () => {

    component.businessHoursForm.get('open24Hours')?.setValue(true);
    fixture.detectChanges();

    const timeRow = fixture.debugElement.query(By.css('.time-row'));

    expect(timeRow).toBeNull();
  });

  // Time Inputs Visible When 24 Hours Unchecked
  it('should show time inputs when open24Hours is false', () => {

    component.businessHoursForm.get('open24Hours')?.setValue(false);
    fixture.detectChanges();

    const timeRow = fixture.debugElement.query(By.css('.time-row'));

    expect(timeRow).not.toBeNull();
  });

  // Submit Function Sets Submitted Flag
  it('should set submitted flag to true when submitHours is called', () => {

    component.submitHours();

    expect(component.submitted).toBeTrue();
  });

});