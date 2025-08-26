import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserClaimsCommentsComponent } from './user-claims-comments.component';

describe('UserClaimsCommentsComponent', () => {
  let component: UserClaimsCommentsComponent;
  let fixture: ComponentFixture<UserClaimsCommentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserClaimsCommentsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserClaimsCommentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
