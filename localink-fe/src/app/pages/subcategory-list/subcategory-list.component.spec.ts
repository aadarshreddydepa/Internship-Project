import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SubcategoryListComponent } from './subcategory-list.component';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { SubcategoryService } from '../../services/subcategory.service';

describe('SubcategoryListComponent', () => {

  let component: SubcategoryListComponent;
  let fixture: ComponentFixture<SubcategoryListComponent>;

  const mockSubcategoryService = {
    getSubcategories: () => of({
      medical: [
        { name: 'Clinic', count: 41 },
        { name: 'Pharmacy', count: 22 }
      ]
    })
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubcategoryListComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: () => 'medical'
              }
            }
          }
        },
        {
          provide: SubcategoryService,
          useValue: mockSubcategoryService
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SubcategoryListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the SubcategoryListComponent', () => {
    expect(component).toBeTruthy();
  });

  it('should load subcategories for the selected category', () => {
    expect(component.subcategories.length).toBeGreaterThan(0);
  });

});