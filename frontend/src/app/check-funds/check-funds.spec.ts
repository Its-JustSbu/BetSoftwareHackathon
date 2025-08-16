import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckFunds } from './check-funds';

describe('CheckFunds', () => {
  let component: CheckFunds;
  let fixture: ComponentFixture<CheckFunds>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CheckFunds]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CheckFunds);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
