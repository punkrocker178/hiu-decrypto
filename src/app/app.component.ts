import { Component, OnInit } from '@angular/core';
import { wordList } from './utility/words';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  public words: string[] = Array(4);
  public codes: number[] = Array(3);
  public wordsMap: Map<string, number> = new Map();
  public codesMap: Map<number, number> = new Map();

  ngOnInit(): void {
  }

  public generateCode(): void {
    this.codesMap.clear();
    for (let i = 0; i < this.codes.length; i++) {
      let random = this._getRandomInt(1, 5);
      while (this.codesMap.has(random)) {
        random = this._getRandomInt(1, 5);
      }
      this.codesMap.set(random, i);
      this.codes[i] = random;
    }
  }

  public randomizeWords(): void {
    this.wordsMap.clear();
    for (let i = 0; i < this.words.length; i++) {
      let random = this._getRandomInt(0, wordList.length);
      while (this.wordsMap.has(wordList[random])) {
        random = this._getRandomInt(0, wordList.length);
      }
      this.wordsMap.set(wordList[random], i);
      this.words[i] = wordList[random];
    }
  }

  public randomizeSingleWord(index: number): void {
    let random = this._getRandomInt(0, wordList.length - 1);
    while (this.wordsMap.has(wordList[random])) {
      random = this._getRandomInt(0, wordList.length - 1);
    }
    this.wordsMap.delete(this.words[index]);
    this.wordsMap.set(wordList[random], index);
    this.words[index] = wordList[random];
  }

  private _getRandomInt(min: number, max: number) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min);
  }
}
