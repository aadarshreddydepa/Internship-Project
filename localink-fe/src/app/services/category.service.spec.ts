import { TestBed } from '@angular/core/testing';
import { CategoryService } from './category.service';

describe('CategoryService', () => {

  let service: CategoryService;

  beforeEach(() => {

    TestBed.configureTestingModule({});
    service = TestBed.inject(CategoryService);

  });

  it('should be created', () => {

    expect(service).toBeTruthy();

  });

  it('should return categories list', () => {

    const categories = service.getCategories();

    expect(categories.length).toBeGreaterThan(0);

  });

  it('should contain medical category', () => {

    const categories = service.getCategories();
    const medical = categories.find(c => c.id === 'medical');

    expect(medical).toBeTruthy();

  });

});