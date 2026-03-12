import { TestBed, ComponentFixture } from '@angular/core/testing';
import { Router } from '@angular/router';
import { SearchComponent } from './search.component';
import { CategoryService } from '../services/category.service';

describe('SearchComponent', () => {

  let component: SearchComponent;
  let fixture: ComponentFixture<SearchComponent>;
  let routerSpy = jasmine.createSpyObj('Router', ['navigate']);
  let categoryService: CategoryService;

  beforeEach(async () => {

    await TestBed.configureTestingModule({
      imports: [SearchComponent],
      providers: [
        CategoryService,
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SearchComponent);
    component = fixture.componentInstance;
    categoryService = TestBed.inject(CategoryService);

    fixture.detectChanges();

  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should load categories from service', () => {

    const categories = categoryService.getCategories();

    expect(component.categories.length).toBe(categories.length);

  });

  it('should render category cards', () => {

    const compiled = fixture.nativeElement as HTMLElement;
    const cards = compiled.querySelectorAll('.category-card');

    expect(cards.length).toBe(component.categories.length);

  });

  it('should navigate to profile page', () => {

    component.goToProfile();

    expect(routerSpy.navigate).toHaveBeenCalledWith(['/profile']);

  });

});