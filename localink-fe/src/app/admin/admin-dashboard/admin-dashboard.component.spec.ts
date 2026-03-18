import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminDashboardComponent } from './admin-dashboard.component';
import { BusinessService } from '../../services/business.service';
import { FormsModule } from '@angular/forms';

describe('AdminDashboardComponent', () => {

  let component: AdminDashboardComponent;
  let fixture: ComponentFixture<AdminDashboardComponent>;
  let service: BusinessService;

  const mockBusinesses:any[] = [
    {
      id:1,
      name:'City Medical Clinic',
      description:'Healthcare clinic',
      category:'Medical',
      contact:'9999999999',
      rating:4.5,
      status:'pending'
    },
    {
      id:2,
      name:'Math Genius Academy',
      description:'Tutoring center',
      category:'Tutoring',
      contact:'7777777777',
      rating:4.8,
      status:'pending'
    }
  ];

  beforeEach(async () => {

    await TestBed.configureTestingModule({
      imports:[AdminDashboardComponent,FormsModule],
      providers:[BusinessService]
    }).compileComponents();

    fixture = TestBed.createComponent(AdminDashboardComponent);
    component = fixture.componentInstance;

    service = TestBed.inject(BusinessService);

    spyOn(service,'getBusinesses').and.returnValue(mockBusinesses);

    spyOn(service,'updateStatus').and.callFake((id:any,status:any)=>{
      const business = mockBusinesses.find(b=>b.id===id);
      if(business) business.status = status;
    });

    spyOn(service,'rejectBusiness').and.callFake((id:any,comment:any)=>{
      const business = mockBusinesses.find(b=>b.id===id);
      if(business){
        business.status='rejected';
        business.rejectionComment=comment;
      }
    });

    fixture.detectChanges();

  });

  it('should create admin dashboard',()=>{
    expect(component).toBeTruthy();
  });

  it('should load businesses from service',()=>{
    expect(service.getBusinesses).toHaveBeenCalled();
    expect(component.businesses.length).toBe(2);
  });

  it('should approve a business',()=>{

    component.approve(1);

    const business = mockBusinesses.find(b=>b.id===1);

    expect(business?.status).toBe('approved');

  });

  it('should reject business with comment',()=>{

    component.rejectBusinessId=1;
    component.rejectComment='Invalid license';

    component.submitRejection();

    const business = mockBusinesses.find(b=>b.id===1);

    expect(business?.status).toBe('rejected');
    expect(business?.rejectionComment).toBe('Invalid license');

  });

  it('should deactivate business',()=>{

    component.approve(1);
    component.deactivate(1);

    const business = mockBusinesses.find(b=>b.id===1);

    expect(business?.status).toBe('inactive');

  });

  it('should activate business',()=>{

    component.approve(1);
    component.deactivate(1);
    component.activate(1);

    const business = mockBusinesses.find(b=>b.id===1);

    expect(business?.status).toBe('approved');

  });

  it('should filter businesses by section',()=>{

    component.currentSection='pending';

    const result = component.filteredBusinesses;

    expect(result.every(b=>b.status==='pending')).toBeTrue();

  });

  it('should open business details modal',()=>{

    component.openDetails(mockBusinesses[0]);

    expect(component.selectedBusiness).toEqual(mockBusinesses[0]);

  });

  it('should show toast notification',()=>{

    component.notify('Business Approved');

    expect(component.showToast).toBeTrue();

  });
});