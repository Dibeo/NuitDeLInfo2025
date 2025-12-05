import { ComponentFixture, TestBed } from '@angular/core/testing';

import { XpBar } from './xp-bar';

describe('XpBar', () => {
  let component: XpBar;
  let fixture: ComponentFixture<XpBar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [XpBar]
    })
    .compileComponents();

    fixture = TestBed.createComponent(XpBar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
