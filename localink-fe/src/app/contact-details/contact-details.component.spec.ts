import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ContactDetailsComponent } from './contact-details.component';
import { ReactiveFormsModule } from '@angular/forms';
import testCases from './contact-details.testcases.json';

describe('ContactDetailsComponent', () => {

  let component: ContactDetailsComponent;
  let fixture: ComponentFixture<ContactDetailsComponent>;

  beforeEach(async () => {

    await TestBed.configureTestingModule({
      imports: [
        ContactDetailsComponent,
        ReactiveFormsModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ContactDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

  });

  testCases.testCases.forEach((testCase) => {

    it(testCase.scenario, () => {

      component.contactForm.setValue(testCase.data);

      expect(component.contactForm.valid).toBe(testCase.expected);

    });

  });

});