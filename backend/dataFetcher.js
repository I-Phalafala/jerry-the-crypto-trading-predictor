const axios = require('axios');

const fetchClosingPriceData = async (tradingPair) => {
  try {
    const response = await axios.get('https://api.binance.com/api/v3/klines', {
      params: {
        symbol: tradingPair,
        interval: '1m', // Fetch data in 1-minute intervals
        limit: 720 // Fetch data for the last 720 minutes (12 hours)
      }
    });
    return response.data.map(candle => parseFloat(candle[4])); // Extract the closing prices
  } catch (error) {
    console.error('Error fetching '+ tradingPair +' price data:', error);
    return [];
  }
};

const fetchTradingPairInfo = async (tradingPair) => {
  try {
    const binanceUrl = `https://api.binance.com/api/v3/ticker/24hr?symbol=${tradingPair}`;
    const coinMarketCapUrl = ``;

    // Fetch data from Binance API
    const binanceResponse = await axios.get(binanceUrl);
    const binanceData = binanceResponse.data;

    // Fetch data from CoinMarketCap API
    const coinMarketCapResponse = await axios.get(coinMarketCapUrl);
    const coinMarketCapData = coinMarketCapResponse.data.data.BTC;

    // Combine data
    const responseData = {
        tradingPair: tradingPair,
        volume: binanceData.volume,
        high: binanceData.highPrice,
        low: binanceData.lowPrice,
        currentPrice: binanceData.lastPrice,
        rank: coinMarketCapData.cmc_rank,
        marketCap: coinMarketCapData.quote.USD.market_cap,
        dilutedMarketCap: coinMarketCapData.quote.USD.fully_diluted_market_cap,
        circulatingSupply: coinMarketCapData.circulating_supply
    };

    return responseData;
  } catch (error) {
    console.error('Error fetching '+ tradingPair +' data:', error);
    return [];
  }
};

module.exports = {fetchClosingPriceData, fetchTradingPairInfo};