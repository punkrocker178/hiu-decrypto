import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-word-select',
  templateUrl: './word-select.component.html',
  styleUrls: ['./word-select.component.scss'],
  imports: [
    CommonModule
  ],
  standalone: true
})
export class WordSelectComponent {
  @Input() wordList: string[];

  public isActive: boolean;

  @Output() wordSelected: EventEmitter<string> = new EventEmitter();

  public selectWord(word: string) {
    this.isActive = false;
    this.wordSelected.emit(word);
  }
}
