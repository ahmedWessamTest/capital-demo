import { TestBed } from '@angular/core/testing';

import { NavbarHeightService } from './navbar-height.service';

describe('NavbarHeightService', () => {
  let service: NavbarHeightService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NavbarHeightService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
