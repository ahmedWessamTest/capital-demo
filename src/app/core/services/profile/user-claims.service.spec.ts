import { TestBed } from '@angular/core/testing';

import { UserClaimsService } from './user-claims.service';

describe('UserClaimsService', () => {
  let service: UserClaimsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UserClaimsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
