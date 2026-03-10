import { TestBed } from '@angular/core/testing';
import { BusinessService } from './business.service';

describe('BusinessService', () => {

  let service: BusinessService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BusinessService);
  });

  it('TC01: should create the service', () => {
    expect(service).toBeTruthy();
  });

  it('TC02: should return all businesses', () => {

    const businesses = service.getAllBusinesses();

    expect(businesses.length).toBeGreaterThan(0);

  });

  it('TC03: should return pending businesses', () => {

    const pending = service.getPendingBusinesses();

    expect(pending.every(b => b.status === 'pending')).toBeTrue();

  });

  it('TC04: should approve a business', () => {

    service.approveBusiness(1);

    const business = service.getAllBusinesses().find(b => b.id === 1);

    expect(business?.status).toBe('approved');

  });

  it('TC05: should reject a business', () => {

    service.rejectBusiness(2);

    const business = service.getAllBusinesses().find(b => b.id === 2);

    expect(business?.status).toBe('rejected');

  });

  it('TC06: should deactivate a business', () => {

    service.deactivateBusiness(1);

    const business = service.getAllBusinesses().find(b => b.id === 1);

    expect(business?.status).toBe('inactive');

  });

});