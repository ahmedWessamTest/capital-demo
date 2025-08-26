import { TestBed } from '@angular/core/testing';
import { ResolveFn } from '@angular/router';

import { userPoliciesResolver } from './user-policies.resolver';

describe('userPoliciesResolver', () => {
  const executeResolver: ResolveFn<boolean> = (...resolverParameters) => 
      TestBed.runInInjectionContext(() => userPoliciesResolver(...resolverParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeResolver).toBeTruthy();
  });
});
