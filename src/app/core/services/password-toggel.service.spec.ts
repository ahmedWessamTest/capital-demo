import { TestBed } from '@angular/core/testing';

import { PasswordToggelService } from './password-toggel.service';

describe('PasswordToggelService', () => {
  let service: PasswordToggelService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PasswordToggelService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
