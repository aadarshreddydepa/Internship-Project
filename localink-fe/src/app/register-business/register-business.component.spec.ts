import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RegisterBusinessComponent } from './register-business.component';
import { ReactiveFormsModule } from '@angular/forms';

import testCases from './register-business.testcases.json';

describe('RegisterBusinessComponent', () => {

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

  testCases.testCases.forEach((testCase) => {

    it(testCase.scenario, () => {

      component.businessForm.setValue(testCase.data);

      expect(component.businessForm.valid).toBe(testCase.expected);

    });

  });
});