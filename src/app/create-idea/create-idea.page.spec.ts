import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CreateIdeaPage } from './create-idea.page';

describe('CreateIdeaPage', () => {
  let component: CreateIdeaPage;
  let fixture: ComponentFixture<CreateIdeaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateIdeaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
