import { TestBed } from '@angular/core/testing';
import { BusinessService } from './business.service';

describe('BusinessService', () => {

  let service: BusinessService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BusinessService);
  });

  it('should create service', () => {
    expect(service).toBeTruthy();
  });

  it('should return businesses', () => {
    expect(service.getBusinesses().length).toBeGreaterThan(0);
  });

  it('should update business status', () => {

    service.updateStatus(1, 'approved');

    const business = service.getBusinesses().find(b => b.id === 1);

    expect(business?.status).toBe('approved');

  });

});