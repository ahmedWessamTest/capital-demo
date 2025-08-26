import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BuildingPolicyComponent } from './building-policy.component';

describe('BuildingPolicyComponent', () => {
  let component: BuildingPolicyComponent;
  let fixture: ComponentFixture<BuildingPolicyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BuildingPolicyComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BuildingPolicyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
