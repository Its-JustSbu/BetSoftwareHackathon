import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreatePiggyBanks } from './create-piggy-banks';

describe('CreatePiggyBanks', () => {
  let component: CreatePiggyBanks;
  let fixture: ComponentFixture<CreatePiggyBanks>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreatePiggyBanks]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreatePiggyBanks);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
