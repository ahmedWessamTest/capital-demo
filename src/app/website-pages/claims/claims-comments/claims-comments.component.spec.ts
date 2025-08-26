import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClaimsCommentsComponent } from './claims-comments.component';

describe('ClaimsCommentsComponent', () => {
  let component: ClaimsCommentsComponent;
  let fixture: ComponentFixture<ClaimsCommentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClaimsCommentsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClaimsCommentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
