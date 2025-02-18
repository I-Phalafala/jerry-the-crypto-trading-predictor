import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Prediction } from '../models/prediction';
import { PredictionHistory } from '../models/prediction-history';

@Injectable({ providedIn: 'root' })
export class PredictionService {
  private predictionUrl = 'http://api.jerry.cryptorichfriends.com/api/prediction';
  private predictionHistoryUrl = 'http://api.jerry.cryptorichfriends.com/api/prediction-history';

  constructor(private http: HttpClient) {}

  getCurrentPrediction(tradingPair: string): Observable<Prediction> {
    const params = new HttpParams().set('tradingPair', tradingPair);
    return this.http.get<Prediction>(this.predictionUrl, { params });
  }

  getPredictionHistory(tradingPair: string): Observable<PredictionHistory[]> {
    const params = new HttpParams().set('tradingPair', tradingPair);
    return this.http.get<PredictionHistory[]>(this.predictionHistoryUrl, { params });
  }
}