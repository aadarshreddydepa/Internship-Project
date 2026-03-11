import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ContactDetailsComponent } from './contact-details.component';
import { ReactiveFormsModule } from '@angular/forms';

describe('ContactDetailsComponent', () => {

  let component: ContactDetailsComponent;
  let fixture: ComponentFixture<ContactDetailsComponent>;

  beforeEach(async () => {

    await TestBed.configureTestingModule({
      imports: [ContactDetailsComponent, ReactiveFormsModule]
    }).compileComponents();

    fixture = TestBed.createComponent(ContactDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('form should be invalid when empty', () => {
    expect(component.contactForm.valid).toBeFalse();
  });

  it('phone should be invalid if not 10 digits', () => {

    const phone = component.contactForm.controls['phone'];
    phone.setValue('123');

    expect(phone.valid).toBeFalse();

  });

  it('email should be invalid for wrong format', () => {

    const email = component.contactForm.controls['email'];
    email.setValue('abc');

    expect(email.valid).toBeFalse();

  });

  it('pincode should require 6 digits', () => {

    const pincode = component.contactForm.controls['pincode'];
    pincode.setValue('123');

    expect(pincode.valid).toBeFalse();

  });

  it('form should be valid with correct values', () => {

    component.contactForm.setValue({

      phone: '9876543210',
      email: 'business@email.com',
      website: 'https://mybusiness.com',
      address: 'MG Road',
      city: 'Bangalore',
      state: 'Karnataka',
      pincode: '560001'

    });

    expect(component.contactForm.valid).toBeTrue();

  });

});