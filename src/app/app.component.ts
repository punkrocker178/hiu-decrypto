import { Component, OnInit } from '@angular/core';
import { wordList } from './utility/words';
import Pusher, { PresenceChannel } from 'pusher-js';
import { Router } from '@angular/router';
import { EVENTS } from './utility/events';
import { FormControl } from '@angular/forms';
import { GameService } from './services/game.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  public readonly TIME_OUT = 5000;

  public words: string[] = Array(4).fill('-');
  public codes: number[] = Array(3);
  public wordsMap: Map<string, number> = new Map();
  public codesMap: Map<number, number> = new Map();
  public wordListFile = wordList;

  public pusherChannel: PresenceChannel;

  public gameId!: string;
  public players: number = 0;
  public player: string;
  public opponent: string;

  public isReady: boolean;
  public isRoundStarted: boolean;
  public isRoundEnded: boolean;
  public isRoundReady: boolean;

  public round = 1;
  public playerTurn: string = '';
  public generatedCode: string;

  public playerCodes: string = '';
  public opponentCodes: string = '';
  public isHideCode: boolean;

  public playerGuess: string | null;
  public guessControl: FormControl<string> = new FormControl();

  public successToken: number = 0;
  public failedToken: number = 0;

  public opponentSuccessToken: number = 0;
  public opponentFailedToken: number = 0;

  public isWin: boolean;
  public isLose: boolean;

  // Offline
  public isOfflineMode: boolean;
  public isCodeGenerated: boolean;

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

  public updateWord(word: string, index: number) {
    this.words[index] = word;
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

    // According to feedbacks, many players unable to remember the code
    // this._timeout = setTimeout(() => {
    //   this.isHideCode = true;
    // }, this.TIME_OUT);
  }

  public endRound(): void {
    this.guessControl.reset();
    this.playerGuess = '';
    this.playerCodes = '';
    this.opponentCodes = '';
    this.isRoundStarted = false;
    this.isRoundReady = false;
  }

  public newRound(): void {
    this.isRoundReady = true;
    this._gameService.newRound(this.player).subscribe();
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
    // Needs rework
    if (!this.isOfflineMode) {
      this._gameService.reset().subscribe();
    } else {
      this.words.fill('-');
      this.wordsMap.clear();
      this.codesMap.clear();
      this.codes.fill(0);
      this.playerCodes = '---';
      this.isCodeGenerated = false;
      this.isHideCode = false;
    }
  }

  public hideCode(): void {
    this.isHideCode = true;
  }

  public clientGenerateCode(): void {
    this.codesMap.clear();
    for (let i = 0; i < this.codes.length; i++) {
      let random = this._getRandomInt(1, 5);
      while (this.codesMap.has(random)) {
        random = this._getRandomInt(1, 5);
      }
      this.codesMap.set(random, i);
      this.codes[i] = random;
      this.playerCodes = this.codes.join('');
      this.isCodeGenerated = true;
      // setTimeout(() => {
      //   this.isHideCode = true;
      // }, this.TIME_OUT);
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
      this.isRoundReady = false;
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

      this.opponentSuccessToken = data.result[this.opponent].successToken;
      this.opponentFailedToken = data.result[this.opponent].failedToken;

      alert(`Round has ended. The correct answer is ${this.generatedCode}`)

      this.isWin = this.successToken === 2 || this.opponentFailedToken === 2;
      this.isLose = this.failedToken === 2 || this.opponentSuccessToken === 2;

      if (this.isWin) {
        alert(`You WINNNNNNNNNNN`);
      }

      if (this.isLose) {
        alert(`You lose :(`);
      }

      this.endRound();
    });

    this.pusherChannel.bind(EVENTS.MEMBER_ADDED, (member: any) => {
      this.players++;
      this.opponent = member.id;
    });

    this.pusherChannel.bind(EVENTS.MEMBER_REMOVED, (member: any) => {
      this._gameService.removeMember(member.id).subscribe();
      this.players--;
    });

    this.pusherChannel.bind(EVENTS.SUBSCRIPTION_SUCCEEDED, (members: { count: any; }) => {
      this.players = members.count;
      this.player = this.pusherChannel.members.myID;
      this.pusherChannel.members.each((memberId: any) => {
        if (this.player !== memberId.id) {
          this.opponent = memberId.id;
        }
      });

      this._gameService.addMember(this.player).subscribe();
    })
  }

  // helper function to create a unique presence channel
  // name for each game
  private _getUniqueId() {
    return 'presence-' + Math.random().toString(36).substring(2, 8);
  }
}
