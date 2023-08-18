import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WordSelectComponent } from './word-select.component';


describe('WordCardComponent', () => {
  let component: WordSelectComponent;
  let fixture: ComponentFixture<WordSelectComponent>;

  beforeEach(() => {
    // TestBed.configureTestingModule({
    // });
    fixture = TestBed.createComponent(WordSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
