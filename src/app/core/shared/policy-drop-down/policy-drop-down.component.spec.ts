import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PolicyDropDownComponent } from './policy-drop-down.component';

describe('PolicyDropDownComponent', () => {
  let component: PolicyDropDownComponent;
  let fixture: ComponentFixture<PolicyDropDownComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PolicyDropDownComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PolicyDropDownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
