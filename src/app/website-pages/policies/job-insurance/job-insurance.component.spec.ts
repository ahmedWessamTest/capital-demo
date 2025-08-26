import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobInsuranceComponent } from './job-insurance.component';

describe('JobInsuranceComponent', () => {
  let component: JobInsuranceComponent;
  let fixture: ComponentFixture<JobInsuranceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JobInsuranceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JobInsuranceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
