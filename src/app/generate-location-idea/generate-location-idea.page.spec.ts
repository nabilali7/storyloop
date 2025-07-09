import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GenerateLocationIdeaPage } from './generate-location-idea.page';

describe('GenerateLocationIdeaPage', () => {
  let component: GenerateLocationIdeaPage;
  let fixture: ComponentFixture<GenerateLocationIdeaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(GenerateLocationIdeaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
