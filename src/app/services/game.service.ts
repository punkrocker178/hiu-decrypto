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

  public addMember(playerId: any): Observable<any> {
    return this._httpClient.post('/api/member/add', { playerId }, { responseType: 'text' });
  }

  public removeMember(playerId: any): Observable<any> {
    return this._httpClient.delete(`/api/member/remove/${playerId}`, { responseType: 'text' });
  }

  public playerGuest(payload: any): Observable<any> {
    return this._httpClient.post('/api/guess', payload, { responseType: 'text' });
  }

  public newRound(playerId: any): Observable<any> {
    return this._httpClient.post('/api/startRound', { playerId }, { responseType: 'text' });
  }

  public reset(): Observable<any> {
    return this._httpClient.post('/api/reset', null, { responseType: 'text' });
  }
}
