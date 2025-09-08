import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobCorporateFormComponent } from './job-corporate-form.component';

describe('JobCorporateFormComponent', () => {
  let component: JobCorporateFormComponent;
  let fixture: ComponentFixture<JobCorporateFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JobCorporateFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JobCorporateFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
