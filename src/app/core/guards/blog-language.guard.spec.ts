import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { blogLanguageGuard } from './blog-language.guard';

describe('blogLanguageGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => blogLanguageGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
