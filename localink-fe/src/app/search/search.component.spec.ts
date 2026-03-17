import { TestBed, ComponentFixture } from '@angular/core/testing';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SearchComponent } from './search.component';
import { CategoryService, Category } from '../services/category.service';

describe('SearchComponent', () => {

  let component: SearchComponent;
  let fixture: ComponentFixture<SearchComponent>;
  let routerSpy = jasmine.createSpyObj('Router', ['navigate']);
  let categoryService: CategoryService;

  beforeEach(async () => {

    await TestBed.configureTestingModule({
      imports: [SearchComponent, FormsModule],
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

  it('should load categories from service on init', () => {
    const categories = categoryService.getCategories();
    expect(component.categories.length).toBe(categories.length);
  });

  it('should render all category cards when searchTerm is empty', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const cards = compiled.querySelectorAll('.category-card');
    expect(cards.length).toBe(component.categories.length);
  });

  it('should filter categories by search term', () => {
    component.searchTerm = 'medical';
    const result = component.filteredCategories;
    expect(result.length).toBe(1);
    expect(result[0].id).toBe('medical');
  });

  it('should return all categories when searchTerm is blank', () => {
    component.searchTerm = '';
    expect(component.filteredCategories.length).toBe(component.categories.length);
  });

  it('should return empty array when no category matches search term', () => {
    component.searchTerm = 'nonexistentcategory';
    expect(component.filteredCategories.length).toBe(0);
  });

  it('should filter categories case-insensitively', () => {
    component.searchTerm = 'FOOD';
    const result = component.filteredCategories;
    expect(result.length).toBe(1);
    expect(result[0].id).toBe('food');
  });

  it('should navigate to profile page', () => {
    component.goToProfile();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/profile']);
  });

  it('should have default username set', () => {
    expect(component.username).toBeTruthy();
  });

});