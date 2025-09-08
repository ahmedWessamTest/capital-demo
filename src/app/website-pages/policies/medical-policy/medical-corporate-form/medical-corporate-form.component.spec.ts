import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MedicalCorporateFormComponent } from './medical-corporate-form.component';

describe('MedicalCorporateFormComponent', () => {
  let component: MedicalCorporateFormComponent;
  let fixture: ComponentFixture<MedicalCorporateFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MedicalCorporateFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MedicalCorporateFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
