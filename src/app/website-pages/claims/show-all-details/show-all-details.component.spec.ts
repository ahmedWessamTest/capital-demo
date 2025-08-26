import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowAllDetailsComponent } from './show-all-details.component';

describe('ShowAllDetailsComponent', () => {
  let component: ShowAllDetailsComponent;
  let fixture: ComponentFixture<ShowAllDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShowAllDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShowAllDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
