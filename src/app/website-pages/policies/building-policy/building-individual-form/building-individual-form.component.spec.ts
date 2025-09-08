import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BuildingIndividualFormComponent } from './building-individual-form.component';

describe('BuildingIndividualFormComponent', () => {
  let component: BuildingIndividualFormComponent;
  let fixture: ComponentFixture<BuildingIndividualFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BuildingIndividualFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BuildingIndividualFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
