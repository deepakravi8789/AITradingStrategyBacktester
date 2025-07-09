import { MarketData } from '../types/trading';

export function calculateSMA(data: MarketData[], period: number): number[] {
  const sma: number[] = [];
  
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      sma.push(NaN);
    } else {
      const sum = data.slice(i - period + 1, i + 1).reduce((acc, d) => acc + d.close, 0);
      sma.push(sum / period);
    }
  }
  
  return sma;
}

export function calculateRSI(data: MarketData[], period: number = 14): number[] {
  const rsi: number[] = [];
  const gains: number[] = [];
  const losses: number[] = [];
  
  for (let i = 1; i < data.length; i++) {
    const change = data[i].close - data[i - 1].close;
    gains.push(change > 0 ? change : 0);
    losses.push(change < 0 ? Math.abs(change) : 0);
  }
  
  // Calculate initial average gain and loss
  let avgGain = gains.slice(0, period).reduce((a, b) => a + b, 0) / period;
  let avgLoss = losses.slice(0, period).reduce((a, b) => a + b, 0) / period;
  
  rsi.push(NaN); // First value is NaN
  
  for (let i = 0; i < period; i++) {
    rsi.push(NaN);
  }
  
  for (let i = period; i < gains.length; i++) {
    avgGain = ((avgGain * (period - 1)) + gains[i]) / period;
    avgLoss = ((avgLoss * (period - 1)) + losses[i]) / period;
    
    const rs = avgGain / avgLoss;
    const rsiValue = 100 - (100 / (1 + rs));
    rsi.push(rsiValue);
  }
  
  return rsi;
}

export function calculateMACD(data: MarketData[], fastPeriod: number = 12, slowPeriod: number = 26, signalPeriod: number = 9): {
  macd: number[];
  signal: number[];
  histogram: number[];
} {
  const fastEMA = calculateEMA(data.map(d => d.close), fastPeriod);
  const slowEMA = calculateEMA(data.map(d => d.close), slowPeriod);
  
  const macd = fastEMA.map((fast, i) => fast - slowEMA[i]);
  const signal = calculateEMA(macd, signalPeriod);
  const histogram = macd.map((m, i) => m - signal[i]);
  
  return { macd, signal, histogram };
}

export function calculateEMA(values: number[], period: number): number[] {
  const ema: number[] = [];
  const multiplier = 2 / (period + 1);
  
  ema[0] = values[0];
  
  for (let i = 1; i < values.length; i++) {
    ema[i] = (values[i] * multiplier) + (ema[i - 1] * (1 - multiplier));
  }
  
  return ema;
}

export function calculateBollingerBands(data: MarketData[], period: number = 20, stdDev: number = 2): {
  upper: number[];
  middle: number[];
  lower: number[];
} {
  const middle = calculateSMA(data, period);
  const upper: number[] = [];
  const lower: number[] = [];
  
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      upper.push(NaN);
      lower.push(NaN);
    } else {
      const slice = data.slice(i - period + 1, i + 1);
      const mean = middle[i];
      const variance = slice.reduce((acc, d) => acc + Math.pow(d.close - mean, 2), 0) / period;
      const standardDeviation = Math.sqrt(variance);
      
      upper.push(mean + (standardDeviation * stdDev));
      lower.push(mean - (standardDeviation * stdDev));
    }
  }
  
  return { upper, middle, lower };
}