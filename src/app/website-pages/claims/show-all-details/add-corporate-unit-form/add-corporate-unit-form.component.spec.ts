import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddCorporateUnitFormComponent } from './add-corporate-unit-form.component';

describe('AddCorporateUnitFormComponent', () => {
  let component: AddCorporateUnitFormComponent;
  let fixture: ComponentFixture<AddCorporateUnitFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddCorporateUnitFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddCorporateUnitFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
