import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EnglishBlogsComponent } from './english-blogs.component';

describe('EnglishBlogsComponent', () => {
  let component: EnglishBlogsComponent;
  let fixture: ComponentFixture<EnglishBlogsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EnglishBlogsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EnglishBlogsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
