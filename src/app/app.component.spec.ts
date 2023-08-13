import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AppComponent } from './app.component';
import { WordCardComponent } from './components/word-card/word-card.component';

describe('AppComponent', () => {
  let fixture: ComponentFixture<AppComponent>;
  let component: AppComponent;

  const checkDupplicate = (arr: string[]): boolean => {
    let i;
    let j;

    for (i = 0; i < arr.length; i++) {
      for (j = i + 1; j < arr.length; j++) {
        if (arr[i] === arr[j]) {
          return true;
        }
      }
    }

    return false;
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        WordCardComponent
      ],
      declarations: [AppComponent]
    }).compileComponents();
  }
  );

  beforeEach(async () => {
    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });

  it('should randomize words uniquely', () => {
    const attempt = 500;
    for (let i = 0; i < attempt; i++) {
      component.randomizeWords();
      expect(checkDupplicate(component.words)).toBeFalse();
    }
  });

  it('should randomize single word', () => {
    const mockRandomIndex = 1;
    const attempt = 500;
    component.randomizeWords();
    for (let i = 0; i < attempt; i++) {
      component.randomizeSingleWord(mockRandomIndex);
      expect(checkDupplicate(component.words)).toBeFalse();
    }

  });
});
