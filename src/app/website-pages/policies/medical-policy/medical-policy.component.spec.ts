import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MedicalPolicyComponent } from './medical-policy.component';

describe('MedicalPolicyComponent', () => {
  let component: MedicalPolicyComponent;
  let fixture: ComponentFixture<MedicalPolicyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MedicalPolicyComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MedicalPolicyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
