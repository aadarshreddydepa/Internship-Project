import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RegisterBusinessComponent } from './register-business.component';
import { ReactiveFormsModule } from '@angular/forms';

describe('RegisterBusinessComponent - FULL COVERAGE', () => {
  let component: RegisterBusinessComponent;
  let fixture: ComponentFixture<RegisterBusinessComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        RegisterBusinessComponent,
        ReactiveFormsModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterBusinessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // 🔥 BASIC

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // ============================================================
  // 🔥 STEP NAVIGATION
  // ============================================================

  it('should start at step 1', () => {
    expect(component.currentStep).toBe(1);
  });

  it('should NOT move to next step if form invalid', () => {
    component.goToNext();
    expect(component.currentStep).toBe(1);
  });

  it('should move to step 2 when form is valid', () => {
    component.businessForm.setValue({
      businessName: 'Test Business',
      description: 'This is a valid business description',
      category: 'Food',
      subcategory: 'Restaurant'
    });

    component.goToNext();

    expect(component.currentStep).toBe(2);
  });

  it('should move back a step', () => {
    component.currentStep = 3;
    component.goToPrevious();
    expect(component.currentStep).toBe(2);
  });

  it('should not go below step 1', () => {
    component.currentStep = 1;
    component.goToPrevious();
    expect(component.currentStep).toBe(1);
  });

  // ============================================================
  // 🔥 FORM VALIDATION
  // ============================================================

  it('should invalidate empty business form', () => {
    expect(component.businessForm.valid).toBeFalse();
  });

  it('should validate correct business form', () => {
    component.businessForm.setValue({
      businessName: 'Test Business',
      description: 'Valid description with enough length',
      category: 'Food',
      subcategory: 'Restaurant'
    });

    expect(component.businessForm.valid).toBeTrue();
  });

  it('should invalidate short description', () => {
    component.businessForm.patchValue({
      businessName: 'Test',
      description: 'short',
      category: 'Food',
      subcategory: 'Restaurant'
    });

    expect(component.businessForm.valid).toBeFalse();
  });

  // ============================================================
  // 🔥 DATA COLLECTION FROM CHILD COMPONENTS
  // ============================================================

  it('should store photo data correctly', () => {
    const photo = 'base64-image';

    component.handlePhotoSelected(photo);

    expect(component.photoData).toBe(photo);
  });

  // ============================================================
  // 🔥 BUSINESS HOURS VALIDATION
  // ============================================================

  it('should validate valid hours (24h)', () => {
    component.hoursData = [
      { mode: '24h' }
    ];

    expect(component.validateBusinessHours()).toBeTrue();
  });

  it('should validate valid custom hours', () => {
    component.hoursData = [
      {
        mode: 'custom',
        slots: [{ open: '09:00', close: '17:00' }]
      }
    ];

    expect(component.validateBusinessHours()).toBeTrue();
  });

  it('should fail when custom hours have no slots', () => {
    component.hoursData = [
      { mode: 'custom', slots: [] }
    ];

    expect(component.validateBusinessHours()).toBeFalse();
  });

  it('should fail when hoursData is empty', () => {
    component.hoursData = [];
    expect(component.validateBusinessHours()).toBeFalse();
  });

  it('should fail when slots are invalid', () => {
    component.hoursData = [
      {
        mode: 'custom',
        slots: [{ open: '', close: '' }]
      }
    ];

    expect(component.validateBusinessHours()).toBeFalse();
  });

  // ============================================================
  // 🔥 STEP 3 → STEP 4 TRANSITION
  // ============================================================

  it('should NOT go to preview if hours invalid', () => {
    component.currentStep = 3;
    component.hoursData = [];

    component.goToNext();

    expect(component.currentStep).toBe(3);
  });

  it('should go to preview if hours valid', () => {
    component.currentStep = 3;
    component.hoursData = [
      { mode: '24h' }
    ];

    component.goToNext();

    expect(component.currentStep).toBe(4);
  });

  // ============================================================
  // 🔥 FINAL SUBMISSION
  // ============================================================

  it('should build final registration payload correctly', () => {
    component.businessData = { name: 'Biz' };
    component.contactData = { phone: '123' };
    component.hoursData = [{ mode: '24h' }];
    component.photoData = 'img';

    component.submitRegistration();

    expect(component.finalRegistrationData).toEqual({
      business: component.businessData,
      contact: component.contactData,
      hours: component.hoursData,
      photo: component.photoData
    });
  });

  it('should show success message after submission', () => {
    component.businessData = {};
    component.contactData = {};
    component.hoursData = [];
    component.photoData = null;

    component.submitRegistration();

    expect(component.submitSuccessMessage).toContain('successfully');
  });

  // ============================================================
  // 🔥 EDGE CASES
  // ============================================================

  it('should handle null data safely', () => {
    component.businessData = null;
    component.contactData = null;
    component.hoursData = [];
    component.photoData = null;

    expect(() => component.submitRegistration()).not.toThrow();
  });

  it('should not break when navigating without data', () => {
    component.currentStep = 2;
    component.goToNext();

    expect(component.currentStep).toBeGreaterThanOrEqual(2);
  });

});