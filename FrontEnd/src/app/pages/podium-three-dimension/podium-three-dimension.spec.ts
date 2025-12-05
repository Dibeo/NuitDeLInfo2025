import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PodiumThreeDimension } from './podium-three-dimension';

describe('PodiumThreeDimension', () => {
  let component: PodiumThreeDimension;
  let fixture: ComponentFixture<PodiumThreeDimension>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PodiumThreeDimension]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PodiumThreeDimension);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
