const express = require('express');
const { body, validationResult } = require('express-validator');
const cors = require('cors');
const { calculateIndicator, checkForSignals } = require('./indicators');
const config = require('./config');
const {fetchClosingPriceData, fetchTradingPairInfo } = require('./dataFetcher');

const SignalHistory = require('./signalHistory');
const btcSignalHistory = new SignalHistory();
const ethSignalHistory = new SignalHistory();
const xrpSignalHistory = new SignalHistory();
const solSignalHistory = new SignalHistory();
const signalHistories = {
  'BTCUSDT': btcSignalHistory,
  'ETHUSDT': ethSignalHistory,
  'XRPUSDT': xrpSignalHistory,
  'SOLUSDT': solSignalHistory
};

const Prediction = require('./prediction');
const PredictionHistory = require('./predictionHistory');
const btcPredictionHistory = new PredictionHistory();
const ethPredictionHistory = new PredictionHistory();
const xrpPredictionHistory = new PredictionHistory();
const solPredictionHistory = new PredictionHistory();
const predictionHistories = {
  'BTCUSDT': btcPredictionHistory,
  'ETHUSDT': ethPredictionHistory,
  'XRPUSDT': xrpPredictionHistory,
  'SOLUSDT': solPredictionHistory
};


const app = express();
app.use(express.json());
const port = 3001;

app.use(cors()); // Enable CORS

// Run strategies
const runStrategies = async (tradingPair) => {
  const data = await fetchClosingPriceData(tradingPair);
  if (data.length === 0) return { signals: [], lastChecked: null };

  const lastChecked = new Date().toLocaleString('en-GB', {
    second: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  const results = config.enabledIndicators.map(strategy => {
    let signals;

    if (strategy === 'SMC') {
      // smc removed for now
    } else {
      const shortIndicator = calculateIndicator(data, config.shortPeriod, strategy);
      const longIndicator = strategy === 'RSI' ? [] : calculateIndicator(data, config.longPeriod, strategy);
      signals = checkForSignals(data, shortIndicator, longIndicator, strategy);
    }

    return {
      strategy,
      signal: signals.buy ? 'buy' : signals.sell ? 'sell' : 'none',
      date: lastChecked,
      tradingPair
    };
  });

  console.log(`Signals for ${tradingPair}:`, results);
  signalHistories[tradingPair].addSignals(results);

  return { signals: results, lastChecked };
};

const runPredictions = async () => {
  for (const tradingPair of config.tradingPairs) {
    await runStrategies(tradingPair);

    const data = await fetchClosingPriceData(tradingPair);

    const prediction = new Prediction(signalHistories[tradingPair].signals, data);
    const predictionResult = await prediction.getPrediction();
    if (predictionResult) {

      const lastPrediction = predictionHistories[tradingPair].predictions[predictionHistories[tradingPair].predictions.length - 1];

      // Check if the new prediction is different from the last one
      if (!lastPrediction || lastPrediction.prediction !== predictionResult.prediction) {
        
        if (predictionResult.prediction !== 'Hold')
          {predictionHistories[tradingPair].closePredictions();}
        
        predictionHistories[tradingPair].addPredictions([predictionResult]);
        console.log(`Prediction for ${tradingPair}:`, predictionResult);
        
      }
    }

    // Update open predictions with the latest price
    const latestPrice = data[data.length - 1];
    predictionHistories[tradingPair].updateOpenPredictions(latestPrice)
  }
};

const runAllPredictions = async () => {
  for (const tradingPair of config.tradingPairs) {
    await runPredictions(tradingPair);
  }
};

// Run predictions every 5 seconds  
setInterval(runAllPredictions, 5000);

// Endpoint to get prediction
app.get('/api/prediction', async (req, res) => {
  const tradingPair = req.query.tradingPair;
  if (!tradingPair) {
    return res.status(400).json({ error: 'Trading pair is required' });
  }

  const prediction = predictionHistories[tradingPair].predictions[predictionHistories[tradingPair].predictions.length - 1];
  res.json(prediction);

});

// Endpoint to get prediction history
app.get('/api/prediction-history', async (req, res) => {
  const tradingPair = req.query.tradingPair;
  if (!tradingPair) {
    return res.status(400).json({ error: 'Trading pair is required' });
  }

  const history = predictionHistories[tradingPair].getPredictions();
  res.json(history);
});

// Endpoint to get the trading pair information
app.get('/api/trading-info', async (req, res) => {
  try {
    const tradingInfo = await fetchTradingPairInfo();
    res.json(tradingInfo);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch trading info' });
  }
});

// Endpoint to get settings
app.get('/api/settings', (req, res) => {
  res.json(config);
});

// Endpoint to update settings
app.post(
  '/api/settings',
  [
      body('strategy').isString().isIn(['The Sir Kabzin (defualt)', 'Custom']),
      body('enabledIndicators').isArray().custom((value) => {
          return value.every(indicator => ['SMA', 'EMA', 'RSI', 'SMC'].includes(indicator));
      }),
      body('shortPeriod').isInt({ min: 1 }),
      body('longPeriod').isInt({ min: 1 }),
      body('rsiPeriod').isInt({ min: 1 }),
      body('rsiOverbought').isInt({ min: 1, max: 100 }),
      body('rsiOversold').isInt({ min: 1, max: 100 })
  ],
  (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
      }

      const newConfig = req.body;
      config.strategy = newConfig.strategy;
      config.enabledIndicators = newConfig.enabledIndicators;
      config.shortPeriod = newConfig.shortPeriod;
      config.longPeriod = newConfig.longPeriod;
      config.rsiPeriod = newConfig.rsiPeriod;
      config.rsiOverbought = newConfig.rsiOverbought;
      config.rsiOversold = newConfig.rsiOversold;

      res.json(config);
  }
);


app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});