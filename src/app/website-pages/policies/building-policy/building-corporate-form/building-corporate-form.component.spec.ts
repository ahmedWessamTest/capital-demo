import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BuildingCorporateFormComponent } from './building-corporate-form.component';

describe('BuildingCorporateFormComponent', () => {
  let component: BuildingCorporateFormComponent;
  let fixture: ComponentFixture<BuildingCorporateFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BuildingCorporateFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BuildingCorporateFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
