import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ContactDetailsComponent } from './contact-details.component';
import { ReactiveFormsModule } from '@angular/forms';

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
})