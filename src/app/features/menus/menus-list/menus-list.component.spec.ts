import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MenusListComponent } from './menus-list.component';

describe('MenusListComponent', () => {
  let component: MenusListComponent;
  let fixture: ComponentFixture<MenusListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MenusListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MenusListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
