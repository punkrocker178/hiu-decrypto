import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, UntypedFormGroup } from '@angular/forms';

@Component({
  selector: 'app-word-select',
  templateUrl: './word-select.component.html',
  styleUrls: ['./word-select.component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  standalone: true
})
export class WordSelectComponent implements OnInit {
  @Input() wordList: string[];

  public filteredWords: string[];

  public isActive: boolean;
  public mainForm: UntypedFormGroup = new FormGroup({
    search: new FormControl<string>(''),
    word: new FormControl<string>('')
  });

  @Output() wordSelected: EventEmitter<string> = new EventEmitter();

  ngOnInit(): void {
    this.filteredWords = this.wordList;

    this.mainForm.controls['search'].valueChanges.subscribe((value) => {
      if (value === '') {
        this.filteredWords = this.wordList;
      }
      this.filteredWords = this.wordList.filter(word => word.startsWith(value));
    });
  }

  public selectWord(word: string) {
    this.isActive = false;

    this.wordSelected.emit(word);
  }
}
