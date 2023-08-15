import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-word-card',
  templateUrl: './word-card.component.html',
  styleUrls: ['./word-card.component.scss'],
  standalone: true
})
export class WordCardComponent {
  @Input() word: string;
  @Input() index: number;
}
