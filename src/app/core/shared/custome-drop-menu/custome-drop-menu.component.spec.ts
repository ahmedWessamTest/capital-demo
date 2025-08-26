import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomeDropMenuComponent } from './custome-drop-menu.component';

describe('CustomeDropMenuComponent', () => {
  let component: CustomeDropMenuComponent;
  let fixture: ComponentFixture<CustomeDropMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomeDropMenuComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomeDropMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
