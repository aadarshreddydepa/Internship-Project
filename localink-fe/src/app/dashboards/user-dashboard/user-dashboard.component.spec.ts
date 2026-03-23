import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserDashboardComponent } from './user-dashboard.component';
import { CategoryService } from '../../services/category.service';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';

describe('UserDashboardComponent', () => {
  let component: UserDashboardComponent;
  let fixture: ComponentFixture<UserDashboardComponent>;

  let mockCategoryService: jasmine.SpyObj<CategoryService>;
  let mockRouter: jasmine.SpyObj<Router>;

  beforeEach(async () => {

    mockCategoryService = jasmine.createSpyObj('CategoryService', ['getCategories']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [UserDashboardComponent],
      providers: [
        { provide: CategoryService, useValue: mockCategoryService },
        { provide: Router, useValue: mockRouter }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UserDashboardComponent);
    component = fixture.componentInstance;
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should load categories on init', () => {

    const mockData = [
      { id: 1, name: 'Food', iconUrl: '' }
    ];

    mockCategoryService.getCategories.and.returnValue(of(mockData));

    fixture.detectChanges();

    expect(component.categories.length).toBe(1);
  });

  it('should handle API error', () => {

    spyOn(console, 'error');

    mockCategoryService.getCategories.and.returnValue(
      throwError(() => new Error('API Error'))
    );

    fixture.detectChanges();

    expect(console.error).toHaveBeenCalledWith(
      'Error fetching categories',
      jasmine.any(Error)
    );
  });

  it('should filter categories correctly', () => {

    component.categories = [
      { id: 1, name: 'Food', iconUrl: '' },
      { id: 2, name: 'Health', iconUrl: '' }
    ];

    component.searchTerm = 'foo';

    const result = component.filteredCategories;

    expect(result.length).toBe(1);
    expect(result[0].name).toBe('Food');
  });

  it('should navigate to profile', () => {

    component.goToProfile();

    expect(mockRouter.navigate).toHaveBeenCalledWith(['/profile']);
  });

  it('should navigate to subcategory', () => {

    component.openCategory(5);

    expect(mockRouter.navigate).toHaveBeenCalledWith(['/subcategory', 5]);
  });

});