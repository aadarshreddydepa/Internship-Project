import { TestBed } from '@angular/core/testing';

import { BusinessHoursService } from './business-hours.service';

describe('BusinessHoursService', () => {
  let service: BusinessHoursService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BusinessHoursService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
