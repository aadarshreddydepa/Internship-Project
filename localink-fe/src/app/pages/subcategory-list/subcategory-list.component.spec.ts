import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SubcategoryListComponent } from './subcategory-list.component';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

describe('SubcategoryListComponent', () => {

  let component: SubcategoryListComponent;
  let fixture: ComponentFixture<SubcategoryListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubcategoryListComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of({
              get: (key: string) => 'Medical'
            })
          }
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

  it('should set categoryName from route parameter', () => {
    expect(component.categoryName).toBe('Medical');
  });

  it('should load subcategories for the selected category', () => {
    expect(component.subcategories.length).toBeGreaterThan(0);
  });

});