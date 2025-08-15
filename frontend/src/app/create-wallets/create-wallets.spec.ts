import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateWallets } from './create-wallets';

describe('CreateWallets', () => {
  let component: CreateWallets;
  let fixture: ComponentFixture<CreateWallets>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateWallets]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateWallets);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
