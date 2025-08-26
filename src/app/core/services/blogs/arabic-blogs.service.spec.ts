import { TestBed } from '@angular/core/testing';

import { ArabicBlogsService } from './arabic-blogs.service';

describe('ArabicBlogsService', () => {
  let service: ArabicBlogsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ArabicBlogsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
