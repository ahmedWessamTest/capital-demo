import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClaimsPageComponent } from './claims-page.component';

describe('ClaimsPageComponent', () => {
  let component: ClaimsPageComponent;
  let fixture: ComponentFixture<ClaimsPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClaimsPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClaimsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
