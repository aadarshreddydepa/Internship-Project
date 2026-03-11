// 

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RegisterBusinessComponent } from './register-business.component';
import { ReactiveFormsModule } from '@angular/forms';

describe('RegisterBusinessComponent', () => {

  let component: RegisterBusinessComponent;
  let fixture: ComponentFixture<RegisterBusinessComponent>;

  beforeEach(async () => {

    await TestBed.configureTestingModule({
      imports: [RegisterBusinessComponent, ReactiveFormsModule]
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterBusinessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('form should be invalid when empty', () => {
    expect(component.businessForm.valid).toBeFalse();
  });

  it('businessName field should be required', () => {
    const name = component.businessForm.controls['businessName'];
    name.setValue('');
    expect(name.valid).toBeFalse();
  });

  it('description field should be required', () => {
    const desc = component.businessForm.controls['description'];
    desc.setValue('');
    expect(desc.valid).toBeFalse();
  });

  it('should update subcategories when category changes', () => {

    component.businessForm.controls['category'].setValue('Food');
    component.onCategoryChange();

    expect(component.subcategories.length).toBeGreaterThan(0);
  });

  it('form should be valid when all fields are filled', () => {

    component.businessForm.setValue({
      businessName: 'ABC Cafe',
      description: 'Best cafe in city',
      category: 'Food',
      subcategory: 'Cafe'
    });

    expect(component.businessForm.valid).toBeTrue();
  });

});