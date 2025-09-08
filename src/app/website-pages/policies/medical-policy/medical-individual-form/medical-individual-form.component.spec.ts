import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MedicalIndividualFormComponent } from './medical-individual-form.component';

describe('MedicalIndividualFormComponent', () => {
  let component: MedicalIndividualFormComponent;
  let fixture: ComponentFixture<MedicalIndividualFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MedicalIndividualFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MedicalIndividualFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
