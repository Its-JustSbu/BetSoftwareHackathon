import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PiggyBanks } from './piggy-banks';

describe('PiggyBanks', () => {
  let component: PiggyBanks;
  let fixture: ComponentFixture<PiggyBanks>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PiggyBanks]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PiggyBanks);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
