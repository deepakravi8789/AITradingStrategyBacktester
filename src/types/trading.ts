export interface MarketData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface TradeSignal {
  date: string;
  type: 'buy' | 'sell';
  price: number;
  quantity: number;
  strategy: string;
  confidence?: number;
}

export interface BacktestResults {
  trades: TradeSignal[];
  performance: {
    totalReturn: number;
    sharpeRatio: number;
    winRate: number;
    maxDrawdown: number;
    totalTrades: number;
    winningTrades: number;
    losingTrades: number;
    averageWin: number;
    averageLoss: number;
    profitFactor: number;
  };
  equityCurve: { date: string; value: number }[];
  signals: TradeSignal[];
}

export interface StrategyConfig {
  name: string;
  parameters: Record<string, number>;
}

export interface OptimizationResult {
  bestParameters: Record<string, number>;
  bestPerformance: number;
  allResults: Array<{
    parameters: Record<string, number>;
    performance: number;
  }>;
}