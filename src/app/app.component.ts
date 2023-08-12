import { Component, OnInit } from '@angular/core';
import { wordList } from  './utility/words';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  public words: string[];
  public codes: number[] = Array(3);

  ngOnInit(): void {
  }

  private _generateCode(): void {

  }

  private _randomizeWord(): void {

  }
}
