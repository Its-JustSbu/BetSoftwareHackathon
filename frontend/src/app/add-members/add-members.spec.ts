import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddMembers } from './add-members';

describe('AddMembers', () => {
  let component: AddMembers;
  let fixture: ComponentFixture<AddMembers>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddMembers]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddMembers);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
