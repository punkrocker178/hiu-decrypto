import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";

@Injectable()
export class GameService {
  constructor(
    private readonly _httpClient: HttpClient
  ) { }

  public ready(playerId: any): Observable<any> {
    return this._httpClient.post('/api/ready', { playerId }, { responseType: 'text' });
  }

  public playerGuest(payload: any): Observable<any> {
    return this._httpClient.post('/api/guess', payload, { responseType: 'text' });
  }

  public newRound(): Observable<any> {
    return this._httpClient.post('/api/startRound', null, { responseType: 'text' });
  }

  public reset(): Observable<any> {
    return this._httpClient.post('/api/reset', null, { responseType: 'text' });
  }
}
