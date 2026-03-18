import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminDashboardComponent } from './admin-dashboard.component';
import { BusinessService } from '../../services/business.service';

describe('AdminDashboardComponent', () => {

  let component: AdminDashboardComponent;
  let fixture: ComponentFixture<AdminDashboardComponent>;

  beforeEach(async () => {

    await TestBed.configureTestingModule({
      imports: [AdminDashboardComponent],
      providers: [BusinessService]
    }).compileComponents();

    fixture = TestBed.createComponent(AdminDashboardComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();

  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should approve business', () => {
    component.approve(1);
    const business = component.businesses.find(b => b.id === 1);
    expect(business?.status).toBe('approved');
  });

});