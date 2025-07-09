import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoadGamePage } from './load-game.page';

describe('LoadGamePage', () => {
  let component: LoadGamePage;
  let fixture: ComponentFixture<LoadGamePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(LoadGamePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
