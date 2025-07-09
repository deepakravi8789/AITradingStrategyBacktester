import { MarketData, StrategyConfig, OptimizationResult } from '../types/trading';
import { AVAILABLE_STRATEGIES } from './strategies';
import { runBacktest } from './backtesting';

export function optimizeStrategy(
  data: MarketData[],
  strategyName: string,
  metric: 'sharpeRatio' | 'totalReturn' | 'winRate' = 'sharpeRatio',
  maxIterations: number = 100
): OptimizationResult {
  const strategy = AVAILABLE_STRATEGIES[strategyName as keyof typeof AVAILABLE_STRATEGIES];
  if (!strategy) {
    throw new Error(`Strategy ${strategyName} not found`);
  }
  
  const allResults: Array<{
    parameters: Record<string, number>;
    performance: number;
  }> = [];
  
  let bestParameters = {};
  let bestPerformance = -Infinity;
  
  // Generate parameter combinations using grid search
  const parameterKeys = Object.keys(strategy.parameters);
  const parameterGrids = parameterKeys.map(key => {
    const param = strategy.parameters[key];
    const steps = Math.min(10, Math.floor((param.max - param.min) / param.step) + 1);
    const stepSize = (param.max - param.min) / (steps - 1);
    const grid = [];
    
    for (let i = 0; i < steps; i++) {
      grid.push(param.min + (i * stepSize));
    }
    
    return grid;
  });
  
  // Generate all combinations (limited by maxIterations)
  function generateCombinations(grids: number[][], index: number = 0, current: number[] = []): number[][] {
    if (index === grids.length) {
      return [current];
    }
    
    const combinations: number[][] = [];
    for (const value of grids[index]) {
      const newCombination = [...current, value];
      combinations.push(...generateCombinations(grids, index + 1, newCombination));
      
      if (combinations.length >= maxIterations) {
        break;
      }
    }
    
    return combinations.slice(0, maxIterations);
  }
  
  const combinations = generateCombinations(parameterGrids);
  
  for (const combination of combinations) {
    const parameters: Record<string, number> = {};
    parameterKeys.forEach((key, index) => {
      parameters[key] = combination[index];
    });
    
    const config: StrategyConfig = {
      name: strategyName,
      parameters
    };
    
    try {
      const signals = strategy.function(data, config);
      const backtest = runBacktest(data, signals);
      const performance = backtest.performance[metric];
      
      allResults.push({
        parameters: { ...parameters },
        performance
      });
      
      if (performance > bestPerformance) {
        bestPerformance = performance;
        bestParameters = { ...parameters };
      }
    } catch (error) {
      console.warn('Error in optimization iteration:', error);
    }
  }
  
  return {
    bestParameters,
    bestPerformance,
    allResults
  };
}