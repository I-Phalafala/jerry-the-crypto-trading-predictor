class PredictionHistory {
    predictions = [];

    constructor(parameters) {
        // Initialize with any parameters if needed
    }

    // Add predictions to the history
    addPredictions(newPredictions) {
        if (!Array.isArray(newPredictions)) {
            throw new TypeError('newPredictions must be an array');
        }
        this.removeLastPrediction(); // Remove last prediction when limit is reached
        this.predictions.push(...newPredictions);
        this.updateOpenPredictions(newPredictions[0].openPrice);
    }

    // Get the history of predictions
    getPredictions() {
        return this.predictions;
    }

    // Remove last prediction from the history when limit is reached
    removeLastPrediction() {
        if (this.predictions.length > 100) {
            this.predictions.shift();
        }
    }

    // set statuses of predictions to closed
    closePredictions(currentPrice) {
        this.predictions.forEach(prediction => {
            if (prediction.status === 'Open') {
                prediction.status = 'Closed';
                prediction.closePrice = currentPrice;
            }
        });
    }

    // update open prediction history items
    updateOpenPredictions(currentPrice) {
        this.predictions.forEach(prediction => {
            if (prediction.status === 'Open') {
                prediction.currentPrice = currentPrice;
                prediction.change = ((currentPrice - prediction.openPrice) / prediction.openPrice * 100).toFixed(2) + '%';
                prediction.profit = (currentPrice - prediction.openPrice).toFixed(2);
            }
        });
    }
}

module.exports = PredictionHistory;