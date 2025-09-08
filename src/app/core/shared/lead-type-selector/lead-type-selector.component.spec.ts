import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeadTypeSelectorComponent } from './lead-type-selector.component';

describe('LeadTypeSelectorComponent', () => {
  let component: LeadTypeSelectorComponent;
  let fixture: ComponentFixture<LeadTypeSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LeadTypeSelectorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LeadTypeSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
