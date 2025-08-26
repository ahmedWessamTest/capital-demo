import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArabicBlogsComponent } from './arabic-blogs.component';

describe('ArabicBlogsComponent', () => {
  let component: ArabicBlogsComponent;
  let fixture: ComponentFixture<ArabicBlogsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArabicBlogsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ArabicBlogsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
