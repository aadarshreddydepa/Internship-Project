import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BusinessListComponent } from './business-list.component';
import { ActivatedRoute } from '@angular/router';
import { of, throwError, Subscription } from 'rxjs';
import { BusinessListService } from '../../services/business-list.service';
import { RouterModule } from '@angular/router';

describe('BusinessListComponent', () => {
  let component: BusinessListComponent;
  let fixture: ComponentFixture<BusinessListComponent>;
  let mockService: jasmine.SpyObj<BusinessListService>;

  beforeEach(async () => {

    mockService = jasmine.createSpyObj('BusinessListService', ['getBusinessesBySubcategory']);

    await TestBed.configureTestingModule({
      imports: [BusinessListComponent, RouterModule],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: (key: string) => {
                  if (key === 'categoryId') return '1';
                  if (key === 'subcategoryId') return '10';
                  return null;
                }
              },
              queryParamMap: {
                get: (key: string) => {
                  if (key === 'categoryName') return 'Food';
                  if (key === 'subcategoryName') return 'Restaurants';
                  return null;
                }
              }
            }
          }
        },
        { provide: BusinessListService, useValue: mockService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(BusinessListComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize route parameters correctly', () => {

    mockService.getBusinessesBySubcategory.and.returnValue(of([]));

    fixture.detectChanges();

    expect(component.categoryId).toBe(1);
    expect(component.categoryName).toBe('Food');
    expect(component.subcategoryName).toBe('Restaurants');
  });

  it('should fetch businesses and set pagination correctly', () => {

    const mockData = [
      { id: 1 }, { id: 2 }, { id: 3 },
      { id: 4 }, { id: 5 }, { id: 6 }
    ];

    mockService.getBusinessesBySubcategory.and.returnValue(of(mockData));

    fixture.detectChanges();

    expect(component.businesses.length).toBe(6);
    expect(component.totalPages).toBe(2);
    expect(component.paginatedBusinesses.length).toBe(5);
  });

  it('should handle API error gracefully', () => {

    spyOn(console, 'error');

    mockService.getBusinessesBySubcategory.and.returnValue(
      throwError(() => new Error('API Error'))
    );

    fixture.detectChanges();

    expect(console.error).toHaveBeenCalledWith(
      'Error fetching businesses',
      jasmine.any(Error)
    );
  });

  it('should change page correctly', () => {

    component.businesses = new Array(10).fill({}).map((_, i) => ({ id: i + 1 }));
    component.pageSize = 5;
    component.totalPages = 2;

    component.changePage(2);

    expect(component.currentPage).toBe(2);
  });

  it('should not change page if invalid', () => {

    component.currentPage = 1;
    component.totalPages = 2;

    component.changePage(0);
    expect(component.currentPage).toBe(1);

    component.changePage(3);
    expect(component.currentPage).toBe(1);
  });


});