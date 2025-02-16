// config.js
module.exports = {
    tradingPairs: ['BTCUSDT', 'XRPUSDT', 'ETHUSDT', 'SOLUSDT'], // Trading pairs to watch
    strategy: 'The Sir Kabzin (defualt)', // Change to 'SMA', 'EMA', 'RSI', or 'SMC'
    enabledIndicators: ['SMA', 'EMA', 'RSI'], // Enabled indicators
    shortPeriod: 5,  // 5 minutes for moving averages
    longPeriod: 60,  // 60 minutes for moving averages
    rsiPeriod: 14,   // 14 periods for RSI
    rsiOverbought: 70,
    rsiOversold: 30
  };