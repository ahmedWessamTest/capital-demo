import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserPoliciesCommentsComponent } from './user-policies-comments.component';

describe('UserPoliciesCommentsComponent', () => {
  let component: UserPoliciesCommentsComponent;
  let fixture: ComponentFixture<UserPoliciesCommentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserPoliciesCommentsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserPoliciesCommentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
