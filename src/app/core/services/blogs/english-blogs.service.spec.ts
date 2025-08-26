import { TestBed } from '@angular/core/testing';

import { EnglishBlogsService } from './english-blogs.service';

describe('EnglishBlogsService', () => {
  let service: EnglishBlogsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EnglishBlogsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
