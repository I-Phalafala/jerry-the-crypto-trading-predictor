import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, OnDestroy } from '@angular/core';
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
  @Input() historyList: PredictionHistory[] = [];
  private intervalId: any;
  private subscription: Subscription = new Subscription();
  fullHistoryList: PredictionHistory[] = [];
  showAll: boolean = false;
  tradingPair = 'BTCUSDT'; // Example trading pair

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
        })
    );
  }

  toggleViewAll(): void {
    this.showAll = !this.showAll;
    this.historyList = this.showAll ? this.fullHistoryList : this.fullHistoryList.slice(0, 5);
  }
}