import { Component, OnInit } from '@angular/core';
import { wordList } from './utility/words';
import Pusher, { PresenceChannel } from 'pusher-js';
import { ActivatedRoute, Router } from '@angular/router';
import { EVENTS } from './utility/events';
import { FormControl } from '@angular/forms';
import { GameService } from './services/game.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  public words: string[] = Array(4).fill('-');
  public codes: number[] = Array(3);
  public wordsMap: Map<string, number> = new Map();
  public codesMap: Map<number, number> = new Map();

  public pusherChannel: PresenceChannel;

  public gameId!: string;
  public players: number = 0;
  public player: string;

  public isReady: boolean;
  public isRoundStarted: boolean;
  public isRoundEnded: boolean;

  public round = 1;
  public playerTurn: string = '';
  public generatedCode: string;

  public playerCodes: string = '';
  public opponentCodes: string = '';
  public isHideCode: boolean;

  public playerGuess: string | null;
  public guessControl: FormControl<string> = new FormControl();

  public successToken: number;
  public failedToken: number;

  public isWin: boolean;
  public isLose: boolean;

  private _timeout: any;

  constructor(
    private readonly _router: Router,
    private readonly _gameService: GameService
  ) {
  }

  ngOnInit(): void {
    this._setGameId();
    this._subscribePusher();
  }

  public ready(): void {
    this.isReady = true;
    this._gameService.ready(this.player).subscribe();
  }

  public startRound() {
    this.isHideCode = false;
    if (this.playerTurn === this.player) {
      this.playerCodes = this.generatedCode;
      this.opponentCodes = '---';
    } else {
      this.playerCodes = '---';
      this.opponentCodes = this.generatedCode;
    }

    this._timeout = setTimeout(() => {
      this.isHideCode = true;
    }, 3000);
  }

  public endRound(): void {
    this.guessControl.reset();
    this.playerGuess = '';
    this.playerCodes = '';
    this.opponentCodes = '';
    this.isRoundStarted = false;
  }

  public newRound(): void {
    this._gameService.newRound().subscribe();
  }

  public guess(): void {
    this.playerGuess = this.guessControl.value;
    const guessPayload = {
      playerGuessCode: this.playerGuess,
      playerId: this.player
    }
    this._gameService.playerGuest(guessPayload).subscribe(() => {
    });
  }

  public resetGame(): void {
    this._gameService.reset().subscribe();
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

  private _setGameId(): void {
    const currentGameId = new URLSearchParams(window.location.search).get('gameId');

    if (!currentGameId) {
      const gameId = this._getUniqueId();
      this._router.navigate(
        [''],
        {
          queryParams: {
            gameId: gameId
          },
          queryParamsHandling: 'merge',
          onSameUrlNavigation: 'reload'
        }
      );
      this.gameId = gameId;
    } else {
      this.gameId = currentGameId;
    }
  }

  private _subscribePusher(): void {
    Pusher.logToConsole = true;

    const pusher = new Pusher('761c85d3ce543ed44588', {
      cluster: 'ap1'
    });

    this.pusherChannel = pusher.subscribe(this.gameId) as PresenceChannel;

    this.pusherChannel.bind(EVENTS.GAME_RESET, () => {
      clearTimeout(this._timeout);
      this.round = 1;
      this.successToken = 0;
      this.failedToken = 0;
      this.isReady = false;
      this.isRoundStarted = false;
      this.isRoundEnded = false;
      this.playerCodes = '';
      this.opponentCodes = '';
      this.wordsMap.clear();
      this.words.fill('');
    });

    this.pusherChannel.bind(EVENTS.ROUND_STARTED, (data: any) => {
      this.isRoundStarted = true;
      this.isRoundEnded = false;
      this.generatedCode = data.generatedCode;
      this.playerTurn = data.playerTurn;
      this.round = data.round;
      this.startRound();
    })

    this.pusherChannel.bind(EVENTS.ROUND_ENDED, (data: any) => {
      this.isRoundEnded = true;
      this.isHideCode = false;
      this.successToken = data.result[this.player].successToken;
      this.failedToken = data.result[this.player].failedToken;

      if (this.successToken === 2) {

      }

      if (this.failedToken === 2) {

      }

      this.endRound();
    });

    this.pusherChannel.bind(EVENTS.MEMBER_ADDED, (member: any) => this.players++);
    this.pusherChannel.bind(EVENTS.MEMBER_REMOVED, (member: any) => this.players--);
    this.pusherChannel.bind(EVENTS.SUBSCRIPTION_SUCCEEDED, (members: { count: any; }) => {
      this.players = members.count;
      this.player = this.pusherChannel.members.myID;
    })
  }

  // helper function to create a unique presence channel
  // name for each game
  private _getUniqueId() {
    return 'presence-' + Math.random().toString(36).substring(2, 8);
  }
}
