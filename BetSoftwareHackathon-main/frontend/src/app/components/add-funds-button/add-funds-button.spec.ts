import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddFundsButton } from './add-funds-button';

describe('AddFundsButton', () => {
  let component: AddFundsButton;
  let fixture: ComponentFixture<AddFundsButton>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddFundsButton]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddFundsButton);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
