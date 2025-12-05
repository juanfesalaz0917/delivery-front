import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MotorcyclesFormComponent } from './motorcycle-form.component';

describe('MotorcyclesFormComponent', () => {
  let component: MotorcyclesFormComponent;
  let fixture: ComponentFixture<MotorcyclesFormComponent>;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MotorcyclesFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MotorcyclesFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
