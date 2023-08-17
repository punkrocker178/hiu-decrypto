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
  public readonly NUM_PLAYERS = 2;
  public readonly MAX_ROUNDS = 6;

  public words: string[] = Array(4).fill('-');
  public codes: number[] = Array(3);
  public wordsMap: Map<string, number> = new Map();
  public codesMap: Map<number, number> = new Map();

  public pusherChannel: PresenceChannel;

  public gameId!: string;
  public players: number = 0;
  public player: string;

  public opponentReady: boolean;
  public playersReady: number = 0;

  public isReady: boolean;
  public isGameStarted: boolean;

  public round = 1;
  public playersTurn: string[] = [];
  public generatedCode: string;

  public playerCodes: string | null;
  public opponentCodes: string | null;

  public playerGuess: string;
  public guesses: number;
  public guessControl: FormControl<string> = new FormControl();

  public successToken: number;
  public failedToken: number;

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
    this._gameService.ready(this.player).subscribe((res) => console.log(res));
  }

  public startGame(): void {
    const membersId = Object.keys(this.pusherChannel.members.members);
    for (let i = 1; i <= this.MAX_ROUNDS; i++) {
      if (i % 2 === 0) {
        this.playersTurn.push(membersId[1]);
      } else {
        this.playersTurn.push(membersId[0]);
      }
    }

    const initGameState = {
      members: Object.create({}),
      playersTurn: this.playersTurn,
      round: 1
    };

    membersId.forEach(playerId => {
      initGameState.members[playerId] = {
        successToken: 0,
        failedToken: 0
      }
    });

    this._gameService.startGame(initGameState).subscribe(() => {
    });
  }

  public startRound(round: number) {
    // this.generateCode();
    // this.generatedCode = this.codes.join('');

    if (this.playersTurn[round - 1] === this.player) {
      this.playerCodes = this.generatedCode;
      this.opponentCodes = '---';
    } else {
      this.playerCodes = '---';
      this.opponentCodes = this.generatedCode;
    }
  }

  public endRound(): void {
    this.round++;
    this.startRound(this.round);
  }

  public guess(): void {
    this.playerGuess = this.guessControl.value;
    const guessPayload = {
      playerGuess: this.playerGuess,
      playerId: this.player
    }
    this._gameService.playerGuest(guessPayload).subscribe(() => {

    });
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
    // this.pusherChannel.bind(EVENTS.CLIENT_PLAYER_READY, (playerId: string) => {
    //   this.opponentReady = true;

    //   if (this.isReady === this.opponentReady) {
    //     this.startGame();
    //   }
    // });

    this.pusherChannel.bind(EVENTS.ROUND_STARTED, (data: any) => {
      this.generatedCode = data.generatedCode;

      // Should init game before round starts
      this.startGame();
    })

    this.pusherChannel.bind(EVENTS.ROUND_ENDED, (data: any) => {
      console.log(data);
      this.successToken = data.successToken;
      this.failedToken = data.failedToken;

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
