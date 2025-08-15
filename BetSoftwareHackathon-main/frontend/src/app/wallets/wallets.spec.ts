import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Wallets } from './wallets';

describe('Wallets', () => {
  let component: Wallets;
  let fixture: ComponentFixture<Wallets>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Wallets]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Wallets);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
