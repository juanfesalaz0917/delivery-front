import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RestaurantsFormComponent } from './restaurants-form.component';

describe('RestaurantsFormComponent', () => {
  let component: RestaurantsFormComponent;
  let fixture: ComponentFixture<RestaurantsFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RestaurantsFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RestaurantsFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
