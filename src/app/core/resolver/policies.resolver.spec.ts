import { TestBed } from '@angular/core/testing';
import { ResolveFn } from '@angular/router';

import { policiesResolver } from './policies.resolver';

describe('policiesResolver', () => {
  const executeResolver: ResolveFn<boolean> = (...resolverParameters) => 
      TestBed.runInInjectionContext(() => policiesResolver(...resolverParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeResolver).toBeTruthy();
  });
});
