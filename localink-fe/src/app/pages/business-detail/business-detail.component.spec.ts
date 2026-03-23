import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BusinessDetailComponent } from './business-detail.component';
import { ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';
import { BusinessListService } from '../../services/business-list.service';
import { RouterModule } from '@angular/router';

describe('BusinessDetailComponent', () => {
  let component: BusinessDetailComponent;
  let fixture: ComponentFixture<BusinessDetailComponent>;
  let mockService: jasmine.SpyObj<BusinessListService>;

  beforeEach(async () => {

    mockService = jasmine.createSpyObj('BusinessListService', ['getBusinessById']);

    await TestBed.configureTestingModule({
      imports: [BusinessDetailComponent, RouterModule],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: (key: string) => {
                  if (key === 'id') return '5';
                  return null;
                }
              },
              queryParamMap: {
                get: (key: string) => {
                  if (key === 'categoryName') return 'Food';
                  if (key === 'subcategoryName') return 'Restaurants';
                  if (key === 'categoryId') return '1';
                  if (key === 'subcategoryId') return '10';
                  return null;
                }
              }
            }
          }
        },
        { provide: BusinessListService, useValue: mockService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(BusinessDetailComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize route and query parameters correctly', () => {

    mockService.getBusinessById.and.returnValue(of({}));

    fixture.detectChanges();

    expect(component.categoryName).toBe('Food');
    expect(component.subcategoryName).toBe('Restaurants');
    expect(component.categoryId).toBe(1);
    expect(component.subcategoryId).toBe(10);
  });

  it('should fetch business details successfully', () => {

    const mockBusiness = {
      id: 5,
      name: 'Test Business',
      categoryName: 'Food',
      subcategoryName: 'Restaurants'
    };

    mockService.getBusinessById.and.returnValue(of(mockBusiness));

    fixture.detectChanges();

    expect(component.business).toEqual(mockBusiness);
  });

  it('should handle API error gracefully', () => {

    spyOn(console, 'error');

    mockService.getBusinessById.and.returnValue(
      throwError(() => new Error('API Error'))
    );

    fixture.detectChanges();

    expect(console.error).toHaveBeenCalledWith(
      'Error fetching business details',
      jasmine.any(Error)
    );
  });


});