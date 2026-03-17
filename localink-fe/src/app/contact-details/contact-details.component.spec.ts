import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ContactDetailsComponent } from './contact-details.component';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

describe('ContactDetailsComponent - FULL VALIDATION', () => {
  let component: ContactDetailsComponent;
  let fixture: ComponentFixture<ContactDetailsComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ContactDetailsComponent,
        ReactiveFormsModule,
        HttpClientTestingModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ContactDetailsComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // 🔥 PHONE VALIDATION

  it('should invalidate phone starting with 0', () => {
    component.contactForm.get('phone')?.setValue('0123456789');
    expect(component.contactForm.get('phone')?.valid).toBeFalse();
  });

  it('should invalidate phone less than 10 digits', () => {
    component.contactForm.get('phone')?.setValue('98765');
    expect(component.contactForm.get('phone')?.valid).toBeFalse();
  });

  it('should validate correct Indian phone', () => {
    component.contactForm.get('phone')?.setValue('9876543210');
    expect(component.contactForm.get('phone')?.valid).toBeTrue();
  });

  it('should validate international phone (non +91)', () => {
    component.contactForm.get('phoneCode')?.setValue('+1');
    component.contactForm.get('phone')?.setValue('123456789');
    expect(component.contactForm.get('phone')?.valid).toBeTrue();
  });

  it('should invalidate all zero phone', () => {
    component.contactForm.get('phoneCode')?.setValue('+1');
    component.contactForm.get('phone')?.setValue('0000000000');
    expect(component.contactForm.get('phone')?.valid).toBeFalse();
  });

  // 🔥 EMAIL VALIDATION

  it('should invalidate incorrect email', () => {
    component.contactForm.get('email')?.setValue('abc');
    expect(component.contactForm.get('email')?.valid).toBeFalse();
  });

  it('should validate correct email', () => {
    component.contactForm.get('email')?.setValue('test@mail.com');
    expect(component.contactForm.get('email')?.valid).toBeTrue();
  });

  // 🔥 WEBSITE VALIDATION

  it('should allow empty website', () => {
    component.contactForm.get('website')?.setValue('');
    expect(component.contactForm.get('website')?.valid).toBeTrue();
  });

  it('should invalidate wrong website', () => {
    component.contactForm.get('website')?.setValue('invalid_url');
    expect(component.contactForm.get('website')?.valid).toBeFalse();
  });

  it('should validate correct website', () => {
    component.contactForm.get('website')?.setValue('https://google.com');
    expect(component.contactForm.get('website')?.valid).toBeTrue();
  });

  // 🔥 PINCODE

  it('should invalidate pincode starting with 0', () => {
    component.contactForm.get('pincode')?.setValue('012345');
    expect(component.contactForm.get('pincode')?.valid).toBeFalse();
  });

  it('should validate correct pincode', () => {
    component.contactForm.get('pincode')?.setValue('600001');
    expect(component.contactForm.get('pincode')?.valid).toBeTrue();
  });

  // 🔥 CUSTOM VALIDATOR

  it('should set country mismatch error', () => {
    component.countries = [{ name: 'India', code: '+91' }];
    component.contactForm.patchValue({
      country: 'India',
      phoneCode: '+1'
    });

    component.countryPhoneValidator(component.contactForm);

    expect(component.contactForm.get('phone')?.errors?.['countryMismatch']).toBeTrue();
  });

  // 🔥 INPUT SANITIZATION

  it('should allow only numbers', () => {
    component.allowOnlyNumbers({ target: { value: 'abc123' } });
    expect(component.contactForm.get('phone')?.value).toBe('123');
  });

  it('should remove all zeros input', () => {
    component.allowOnlyNumbers({ target: { value: '0000' } });
    expect(component.contactForm.get('phone')?.value).toBe('');
  });

  // 🔥 SUBMIT

  it('should not emit when form invalid', () => {
    spyOn(component.next, 'emit');
    component.submit();
    expect(component.next.emit).not.toHaveBeenCalled();
  });

  it('should emit on valid form', () => {
    spyOn(component.next, 'emit');

    component.contactForm.patchValue({
      phoneCode: '+91',
      phone: '9876543210',
      email: 'test@test.com',
      address: 'addr',
      city: 'city',
      state: 'state',
      country: 'India',
      pincode: '600001'
    });

    component.submit();

    expect(component.next.emit).toHaveBeenCalled();
  });
});