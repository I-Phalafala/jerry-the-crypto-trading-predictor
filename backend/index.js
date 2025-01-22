const express = require('express');
const { body, validationResult } = require('express-validator');
const cors = require('cors');
const { calculateIndicator, checkForSignals } = require('./indicators');
const config = require('./config');
const {fetchClosingPriceData, fetchTradingPairInfo } = require('./dataFetcher');
const SignalHistory = require('./signalHistory');
const signalHistory = new SignalHistory();
const Prediction = require('./prediction');
const PredictionHistory = require('./predictionHistory');
const predictionHistory = new PredictionHistory();


const app = express();
app.use(express.json());
const port = 3001;

app.use(cors()); // Enable CORS

const runStrategies = async () => {
  const data = await fetchClosingPriceData();
  if (data.length === 0) return { signals: [], lastChecked: null};

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
      //smc removed for now
    } else {
      const shortIndicator = calculateIndicator(data, config.shortPeriod, strategy);
      const longIndicator = strategy === 'RSI' ? [] : calculateIndicator(data, config.longPeriod, strategy);
      signals = checkForSignals(data, shortIndicator, longIndicator, strategy);
    }

    return {
      strategy,
      signal: signals.buy ? 'buy' : signals.sell ? 'sell' : 'none',
        date: lastChecked
    };
  });

    console.log('Signals:', results);
    signalHistory.addSignals(results);


  return { signals: results, lastChecked};
};


// Endpoint to get prediction
app.get('/api/prediction', async (req, res) => {
  data = await fetchClosingPriceData();
  runStrategies();
  let prediction = new Prediction(signalHistory.signals, data);
  predictionResult = await prediction.getPrediction();
  if (predictionResult) {
      // close predictions when hold is received
      if (predictionResult.prediction == 'Hold') {
          predictionHistory.closePredictions();
      }

      // Check if the new prediction is different from the last one
      const lastPrediction = predictionHistory.predictions[predictionHistory.predictions.length - 1];
      if (!lastPrediction || lastPrediction.prediction !== predictionResult.prediction) {
          predictionHistory.addPredictions([predictionResult]);
      }
  }
  res.json(predictionResult);
});

// Endpoint to get prediction history
app.get('/api/prediction-history', async (req, res) => {
  try {
    const data = await fetchClosingPriceData();
    const latestPrice = data[data.length - 1];
    predictionHistory.updateOpenPredictions(latestPrice)
    const predictions = await predictionHistory.getPredictions();
    res.json(predictions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch prediction history' });
  }
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