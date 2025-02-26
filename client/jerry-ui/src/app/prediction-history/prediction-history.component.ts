import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { PredictionService } from '../services/predictions.service';
import { PredictionHistory } from '../models/prediction-history';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-prediction-history',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './prediction-history.component.html',
  styleUrl: './prediction-history.component.css'
})
export class PredictionHistoryComponent implements OnInit, OnDestroy {
  historyList: PredictionHistory[] = [];
  @Output() accuracyCalculated = new EventEmitter<number>();
  private intervalId: any;
  private subscription: Subscription = new Subscription();
  fullHistoryList: PredictionHistory[] = [];
  showAll: boolean = false;
  tradingPair = 'BTCUSDT'; // Example trading pair
  predictionAccuracy: number = 0;

  constructor(private predictionService: PredictionService) {}

  ngOnInit(): void {
    this.fetchPredictionHistory();
    this.intervalId = setInterval(() => {
      this.fetchPredictionHistory();
    }, 5000);
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    this.subscription.unsubscribe();
  }

  fetchPredictionHistory(): void {
    this.subscription.add(
        this.predictionService.getPredictionHistory(this.tradingPair).subscribe(history => {
            this.fullHistoryList = history
                .sort((a, b) => new Date(b.predictionTime).getTime() - new Date(a.predictionTime).getTime()); // Sort by predictionTime from most recent to oldest
            this.historyList = this.showAll ? this.fullHistoryList : this.fullHistoryList.slice(0, 5); // Respect the showAll state
            this.calculatePredictionAccuracy();
        })
    );
  }

  toggleViewAll(): void {
    this.showAll = !this.showAll;
    this.historyList = this.showAll ? this.fullHistoryList : this.fullHistoryList.slice(0, 5);
  }

  calculatePredictionAccuracy(): void {
    let correctPredictions = 0;
    let totalPredictions = 0;
  
    for (let i = 0; i < this.fullHistoryList.length; i++) {
      const prediction = this.fullHistoryList[i];
  
      // Skip records with NaN values
      if (isNaN(prediction.profit)) {
        continue;
      }
  
      totalPredictions++;

      if (prediction.prediction === 'Buy') {
        if (prediction.profit > 0) {
          correctPredictions++;
        }
      } else if (prediction.prediction === 'Sell') {
        if (prediction.profit < 0) {
          correctPredictions++;
        }
      } else if (prediction.prediction === 'Hold') {
        // Apply the rules for hold predictions
        if (i > 0) {
          const previousPrediction = this.fullHistoryList[i - 1];
          if (previousPrediction.prediction === 'Buy' && prediction.profit > 0) {
            correctPredictions++;
          } else if (previousPrediction.prediction === 'Sell' && prediction.profit < 0) {
            correctPredictions++;
          }
        }
      }
      
    }
  
    this.predictionAccuracy = totalPredictions > 0 ? parseFloat(((correctPredictions / totalPredictions) * 100).toFixed(1)) : 0;
    this.accuracyCalculated.emit(this.predictionAccuracy);
  }
}