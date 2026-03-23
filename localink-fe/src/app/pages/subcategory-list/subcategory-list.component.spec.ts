import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SubcategoryListComponent } from './subcategory-list.component';
import { ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';
import { SubcategoryService } from '../../services/subcategory.service';
import { CategoryService } from '../../services/category.service';
import { RouterModule } from '@angular/router';

describe('SubcategoryListComponent', () => {
  let component: SubcategoryListComponent;
  let fixture: ComponentFixture<SubcategoryListComponent>;

  let mockSubcategoryService: jasmine.SpyObj<SubcategoryService>;
  let mockCategoryService: jasmine.SpyObj<CategoryService>;

  beforeEach(async () => {

    mockSubcategoryService = jasmine.createSpyObj('SubcategoryService', ['getSubcategories']);
    mockCategoryService = jasmine.createSpyObj('CategoryService', ['getCategories']);

    await TestBed.configureTestingModule({
      imports: [SubcategoryListComponent, RouterModule],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: () => '1'
              }
            }
          }
        },
        { provide: SubcategoryService, useValue: mockSubcategoryService },
        { provide: CategoryService, useValue: mockCategoryService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SubcategoryListComponent);
    component = fixture.componentInstance;
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should load category name and subcategories on init', () => {

    const mockCategories = [
      { id: 1, name: 'Food', iconUrl: '' }
    ];

    const mockSubcategories = [
      { id: 10, name: 'Restaurants', iconUrl: '', count: 5 }
    ];

    mockCategoryService.getCategories.and.returnValue(of(mockCategories));
    mockSubcategoryService.getSubcategories.and.returnValue(of(mockSubcategories));

    fixture.detectChanges();

    expect(component.categoryId).toBe(1);
    expect(component.displayCategoryName).toBe('Food');
    expect(component.subcategories.length).toBe(1);
  });

  it('should handle category service error', () => {

    spyOn(console, 'error');

    mockCategoryService.getCategories.and.returnValue(
      throwError(() => new Error('Category error'))
    );

    mockSubcategoryService.getSubcategories.and.returnValue(of([]));

    fixture.detectChanges();

    expect(console.error).toHaveBeenCalledWith(
      'Error fetching category name',
      jasmine.any(Error)
    );
  });

  it('should handle subcategory service error', () => {

    spyOn(console, 'error');

    mockCategoryService.getCategories.and.returnValue(of([]));

    mockSubcategoryService.getSubcategories.and.returnValue(
      throwError(() => new Error('Subcategory error'))
    );

    fixture.detectChanges();

    expect(console.error).toHaveBeenCalledWith(
      'Error fetching subcategories',
      jasmine.any(Error)
    );
  });

});