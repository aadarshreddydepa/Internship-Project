import { TestBed } from '@angular/core/testing';
import { PopularService } from './popular.service';

describe('PopularService', () => {

  let service: PopularService;

  beforeEach(() => {

    TestBed.configureTestingModule({});
    service = TestBed.inject(PopularService);

  });

  it('should be created', () => {

    expect(service).toBeTruthy();

  });

  it('should return popular businesses', () => {

    const businesses = service.getPopularBusinesses();

    expect(businesses.length).toBeGreaterThan(0);

  });

  it('should contain business name', () => {

    const businesses = service.getPopularBusinesses();

    expect(businesses[0].name).toBeDefined();

  });

});