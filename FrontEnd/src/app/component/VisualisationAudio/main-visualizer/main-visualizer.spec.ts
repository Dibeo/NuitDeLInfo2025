import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MainVisualizer } from './main-visualizer';

describe('MainVisualizer', () => {
  let component: MainVisualizer;
  let fixture: ComponentFixture<MainVisualizer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MainVisualizer]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MainVisualizer);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
