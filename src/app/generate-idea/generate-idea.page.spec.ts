import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GenerateIdeaPage } from './generate-idea.page';

describe('GenerateIdeaPage', () => {
  let component: GenerateIdeaPage;
  let fixture: ComponentFixture<GenerateIdeaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(GenerateIdeaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
