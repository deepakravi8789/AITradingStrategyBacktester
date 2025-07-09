import { MarketData, TradeSignal, StrategyConfig } from '../types/trading';
import { calculateSMA, calculateRSI, calculateMACD } from './indicators';

export function smaStrategy(data: MarketData[], config: StrategyConfig): TradeSignal[] {
  const { fastPeriod, slowPeriod } = config.parameters;
  const fastSMA = calculateSMA(data, fastPeriod);
  const slowSMA = calculateSMA(data, slowPeriod);
  const signals: TradeSignal[] = [];
  
  let position = 0; // 0 = no position, 1 = long
  
  for (let i = 1; i < data.length; i++) {
    const prevFast = fastSMA[i - 1];
    const prevSlow = slowSMA[i - 1];
    const currentFast = fastSMA[i];
    const currentSlow = slowSMA[i];
    
    if (isNaN(prevFast) || isNaN(prevSlow) || isNaN(currentFast) || isNaN(currentSlow)) {
      continue;
    }
    
    // Buy signal: fast SMA crosses above slow SMA
    if (prevFast <= prevSlow && currentFast > currentSlow && position === 0) {
      signals.push({
        date: data[i].date,
        type: 'buy',
        price: data[i].close,
        quantity: 100,
        strategy: config.name,
        confidence: Math.abs(currentFast - currentSlow) / currentSlow
      });
      position = 1;
    }
    
    // Sell signal: fast SMA crosses below slow SMA
    if (prevFast >= prevSlow && currentFast < currentSlow && position === 1) {
      signals.push({
        date: data[i].date,
        type: 'sell',
        price: data[i].close,
        quantity: 100,
        strategy: config.name,
        confidence: Math.abs(currentFast - currentSlow) / currentSlow
      });
      position = 0;
    }
  }
  
  return signals;
}

export function rsiStrategy(data: MarketData[], config: StrategyConfig): TradeSignal[] {
  const { period, oversoldLevel, overboughtLevel } = config.parameters;
  const rsi = calculateRSI(data, period);
  const signals: TradeSignal[] = [];
  
  let position = 0; // 0 = no position, 1 = long
  
  for (let i = 1; i < data.length; i++) {
    const currentRSI = rsi[i];
    const prevRSI = rsi[i - 1];
    
    if (isNaN(currentRSI) || isNaN(prevRSI)) {
      continue;
    }
    
    // Buy signal: RSI crosses above oversold level
    if (prevRSI <= oversoldLevel && currentRSI > oversoldLevel && position === 0) {
      signals.push({
        date: data[i].date,
        type: 'buy',
        price: data[i].close,
        quantity: 100,
        strategy: config.name,
        confidence: (oversoldLevel - Math.min(prevRSI, currentRSI)) / 100
      });
      position = 1;
    }
    
    // Sell signal: RSI crosses below overbought level
    if (prevRSI >= overboughtLevel && currentRSI < overboughtLevel && position === 1) {
      signals.push({
        date: data[i].date,
        type: 'sell',
        price: data[i].close,
        quantity: 100,
        strategy: config.name,
        confidence: (Math.max(prevRSI, currentRSI) - overboughtLevel) / 100
      });
      position = 0;
    }
  }
  
  return signals;
}

export function momentumStrategy(data: MarketData[], config: StrategyConfig): TradeSignal[] {
  const { lookbackPeriod, threshold } = config.parameters;
  const signals: TradeSignal[] = [];
  
  let position = 0; // 0 = no position, 1 = long
  
  for (let i = lookbackPeriod; i < data.length; i++) {
    const currentPrice = data[i].close;
    const pastPrice = data[i - lookbackPeriod].close;
    const momentum = (currentPrice - pastPrice) / pastPrice * 100;
    
    // Buy signal: positive momentum above threshold
    if (momentum > threshold && position === 0) {
      signals.push({
        date: data[i].date,
        type: 'buy',
        price: currentPrice,
        quantity: 100,
        strategy: config.name,
        confidence: Math.min(momentum / threshold, 1)
      });
      position = 1;
    }
    
    // Sell signal: negative momentum below threshold
    if (momentum < -threshold && position === 1) {
      signals.push({
        date: data[i].date,
        type: 'sell',
        price: currentPrice,
        quantity: 100,
        strategy: config.name,
        confidence: Math.min(Math.abs(momentum) / threshold, 1)
      });
      position = 0;
    }
  }
  
  return signals;
}

export const AVAILABLE_STRATEGIES = {
  'SMA Crossover': {
    function: smaStrategy,
    parameters: {
      fastPeriod: { min: 5, max: 50, default: 10, step: 1 },
      slowPeriod: { min: 10, max: 200, default: 50, step: 1 }
    }
  },
  'RSI Strategy': {
    function: rsiStrategy,
    parameters: {
      period: { min: 5, max: 30, default: 14, step: 1 },
      oversoldLevel: { min: 10, max: 40, default: 30, step: 1 },
      overboughtLevel: { min: 60, max: 90, default: 70, step: 1 }
    }
  },
  'Momentum Strategy': {
    function: momentumStrategy,
    parameters: {
      lookbackPeriod: { min: 5, max: 50, default: 20, step: 1 },
      threshold: { min: 1, max: 10, default: 5, step: 0.1 }
    }
  }
};