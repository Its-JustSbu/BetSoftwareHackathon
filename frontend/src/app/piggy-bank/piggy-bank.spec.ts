import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PiggyBank } from './piggy-bank';

describe('PiggyBank', () => {
  let component: PiggyBank;
  let fixture: ComponentFixture<PiggyBank>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PiggyBank]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PiggyBank);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
