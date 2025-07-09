import { MarketData, TradeSignal, BacktestResults } from '../types/trading';

export function runBacktest(data: MarketData[], signals: TradeSignal[], initialCapital: number = 10000): BacktestResults {
  let capital = initialCapital;
  let position = 0;
  let positionValue = 0;
  let positionPrice = 0;
  
  const trades: TradeSignal[] = [];
  const equityCurve: { date: string; value: number }[] = [];
  const returns: number[] = [];
  
  let totalTrades = 0;
  let winningTrades = 0;
  let losingTrades = 0;
  let totalWin = 0;
  let totalLoss = 0;
  
  // Create a map of signals by date for faster lookup
  const signalMap = new Map<string, TradeSignal>();
  signals.forEach(signal => {
    signalMap.set(signal.date, signal);
  });
  
  for (let i = 0; i < data.length; i++) {
    const currentData = data[i];
    const signal = signalMap.get(currentData.date);
    
    if (signal) {
      if (signal.type === 'buy' && position === 0) {
        // Buy
        position = Math.floor(capital / signal.price);
        positionValue = position * signal.price;
        positionPrice = signal.price;
        capital -= positionValue;
        trades.push(signal);
        totalTrades++;
      } else if (signal.type === 'sell' && position > 0) {
        // Sell
        const saleValue = position * signal.price;
        capital += saleValue;
        const pnl = saleValue - positionValue;
        
        if (pnl > 0) {
          winningTrades++;
          totalWin += pnl;
        } else {
          losingTrades++;
          totalLoss += Math.abs(pnl);
        }
        
        const returnPct = (signal.price - positionPrice) / positionPrice;
        returns.push(returnPct);
        
        position = 0;
        positionValue = 0;
        positionPrice = 0;
        trades.push(signal);
      }
    }
    
    // Calculate current portfolio value
    const currentValue = capital + (position * currentData.close);
    equityCurve.push({
      date: currentData.date,
      value: currentValue
    });
  }
  
  // Calculate performance metrics
  const totalReturn = ((capital + (position * data[data.length - 1].close)) - initialCapital) / initialCapital * 100;
  const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;
  const averageWin = winningTrades > 0 ? totalWin / winningTrades : 0;
  const averageLoss = losingTrades > 0 ? totalLoss / losingTrades : 0;
  const profitFactor = totalLoss > 0 ? totalWin / totalLoss : totalWin > 0 ? Infinity : 0;
  
  // Calculate Sharpe ratio
  const avgReturn = returns.length > 0 ? returns.reduce((a, b) => a + b, 0) / returns.length : 0;
  const variance = returns.length > 0 ? returns.reduce((acc, ret) => acc + Math.pow(ret - avgReturn, 2), 0) / returns.length : 0;
  const stdDev = Math.sqrt(variance);
  const sharpeRatio = stdDev > 0 ? (avgReturn / stdDev) * Math.sqrt(252) : 0; // Annualized
  
  // Calculate maximum drawdown
  let maxDrawdown = 0;
  let peak = initialCapital;
  
  equityCurve.forEach(point => {
    if (point.value > peak) {
      peak = point.value;
    }
    const drawdown = (peak - point.value) / peak * 100;
    if (drawdown > maxDrawdown) {
      maxDrawdown = drawdown;
    }
  });
  
  return {
    trades,
    performance: {
      totalReturn,
      sharpeRatio,
      winRate,
      maxDrawdown,
      totalTrades,
      winningTrades,
      losingTrades,
      averageWin,
      averageLoss,
      profitFactor
    },
    equityCurve,
    signals
  };
}