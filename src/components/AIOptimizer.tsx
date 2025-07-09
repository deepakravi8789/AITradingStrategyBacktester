import React, { useState } from 'react';
import { Brain, Play, CheckCircle, AlertCircle } from 'lucide-react';
import { MarketData, StrategyConfig, OptimizationResult } from '../types/trading';
import { optimizeStrategy } from '../utils/optimization';

interface AIOptimizerProps {
  data: MarketData[];
  strategy: StrategyConfig;
  onOptimizationComplete: (result: OptimizationResult) => void;
  disabled?: boolean;
}

export default function AIOptimizer({ data, strategy, onOptimizationComplete, disabled }: AIOptimizerProps) {
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationMetric, setOptimizationMetric] = useState<'sharpeRatio' | 'totalReturn' | 'winRate'>('sharpeRatio');
  const [maxIterations, setMaxIterations] = useState(50);
  const [lastResult, setLastResult] = useState<OptimizationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleOptimize = async () => {
    if (!data.length || disabled) return;

    setIsOptimizing(true);
    setError(null);

    try {
      const result = await optimizeStrategy(data, strategy.name, optimizationMetric, maxIterations);
      setLastResult(result);
      onOptimizationComplete(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Optimization failed');
    } finally {
      setIsOptimizing(false);
    }
  };

  const getMetricLabel = (metric: string) => {
    switch (metric) {
      case 'sharpeRatio': return 'Sharpe Ratio';
      case 'totalReturn': return 'Total Return';
      case 'winRate': return 'Win Rate';
      default: return metric;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
        <Brain size={20} />
        <span>AI Parameter Optimizer</span>
      </h2>

      <div className="space-y-4">
        {/* Optimization Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Optimization Metric
            </label>
            <select
              value={optimizationMetric}
              onChange={(e) => setOptimizationMetric(e.target.value as any)}
              disabled={isOptimizing || disabled}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="sharpeRatio">Sharpe Ratio</option>
              <option value="totalReturn">Total Return</option>
              <option value="winRate">Win Rate</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Max Iterations
            </label>
            <input
              type="number"
              value={maxIterations}
              onChange={(e) => setMaxIterations(parseInt(e.target.value))}
              min="10"
              max="200"
              step="10"
              disabled={isOptimizing || disabled}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>

        {/* Optimize Button */}
        <button
          onClick={handleOptimize}
          disabled={isOptimizing || disabled || !data.length}
          className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white py-3 px-4 rounded-md transition-colors flex items-center justify-center space-x-2"
        >
          {isOptimizing ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
              <span>Optimizing...</span>
            </>
          ) : (
            <>
              <Play size={18} />
              <span>Start Optimization</span>
            </>
          )}
        </button>

        {/* Error Message */}
        {error && (
          <div className="p-3 bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700 rounded-md flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <span className="text-sm text-red-700 dark:text-red-300">{error}</span>
          </div>
        )}

        {/* Optimization Results */}
        {lastResult && (
          <div className="space-y-4">
            <div className="p-4 bg-green-100 dark:bg-green-900 border border-green-300 dark:border-green-700 rounded-md">
              <div className="flex items-center space-x-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-sm font-medium text-green-700 dark:text-green-300">
                  Optimization Complete
                </span>
              </div>
              <p className="text-sm text-green-600 dark:text-green-400">
                Best {getMetricLabel(optimizationMetric)}: {lastResult.bestPerformance.toFixed(3)}
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Optimized Parameters
              </h3>
              <div className="space-y-2">
                {Object.entries(lastResult.bestParameters).map(([param, value]) => (
                  <div key={param} className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {param.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:
                    </span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Optimization Summary
              </h3>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <p>Tested {lastResult.allResults.length} parameter combinations</p>
                <p>Best performance: {lastResult.bestPerformance.toFixed(3)}</p>
                <p>Optimized for: {getMetricLabel(optimizationMetric)}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}