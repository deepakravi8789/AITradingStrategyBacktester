import React, { useState } from 'react';
import { Play, Brain, BarChart3, Moon, Sun } from 'lucide-react';
import { MarketData, StrategyConfig, BacktestResults, OptimizationResult } from './types/trading';
import { AVAILABLE_STRATEGIES } from './utils/strategies';
import { runBacktest } from './utils/backtesting';
import DataInput from './components/DataInput';
import StrategySelector from './components/StrategySelector';
import PerformanceDashboard from './components/PerformanceDashboard';
import ChartViewer from './components/ChartViewer';
import AIOptimizer from './components/AIOptimizer';
import TradeSignalOutput from './components/TradeSignalOutput';

function App() {
  const [darkMode, setDarkMode] = useState(true);
  const [data, setData] = useState<MarketData[]>([]);
  const [strategy, setStrategy] = useState<StrategyConfig>({
    name: 'SMA Crossover',
    parameters: { fastPeriod: 10, slowPeriod: 50 }
  });
  const [results, setResults] = useState<BacktestResults | null>(null);
  const [isBacktesting, setIsBacktesting] = useState(false);
  const [optimizationEnabled, setOptimizationEnabled] = useState(false);

  const handleDataLoaded = (newData: MarketData[]) => {
    setData(newData);
    setResults(null);
  };

  const handleStrategyChange = (newStrategy: StrategyConfig) => {
    setStrategy(newStrategy);
    setResults(null);
  };

  const handleRunBacktest = async () => {
    if (!data.length) return;

    setIsBacktesting(true);
    
    try {
      const strategyFunction = AVAILABLE_STRATEGIES[strategy.name as keyof typeof AVAILABLE_STRATEGIES];
      const signals = strategyFunction.function(data, strategy);
      const backtestResults = runBacktest(data, signals);
      setResults(backtestResults);
    } catch (error) {
      console.error('Backtesting failed:', error);
    } finally {
      setIsBacktesting(false);
    }
  };

  const handleOptimizationComplete = (optimizationResult: OptimizationResult) => {
    // Update strategy with optimized parameters
    setStrategy(prev => ({
      ...prev,
      parameters: optimizationResult.bestParameters
    }));
    
    // Auto-run backtest with optimized parameters
    setTimeout(() => {
      handleRunBacktest();
    }, 100);
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <div className={`min-h-screen transition-colors ${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <BarChart3 className="w-8 h-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                AI Trading Strategy Backtester
              </h1>
            </div>
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-md bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Controls */}
          <div className="lg:col-span-1 space-y-6">
            <DataInput onDataLoaded={handleDataLoaded} loading={isBacktesting} />
            
            <StrategySelector 
              config={strategy}
              onChange={handleStrategyChange}
              disabled={isBacktesting}
            />

            {/* Backtest Controls */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Backtest Runner</h2>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="optimization"
                    checked={optimizationEnabled}
                    onChange={(e) => setOptimizationEnabled(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="optimization" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Enable AI Optimization
                  </label>
                </div>

                <button
                  onClick={handleRunBacktest}
                  disabled={!data.length || isBacktesting}
                  className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white py-3 px-4 rounded-md transition-colors flex items-center justify-center space-x-2"
                >
                  {isBacktesting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                      <span>Running Backtest...</span>
                    </>
                  ) : (
                    <>
                      <Play size={18} />
                      <span>Run Backtest</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {optimizationEnabled && (
              <AIOptimizer
                data={data}
                strategy={strategy}
                onOptimizationComplete={handleOptimizationComplete}
                disabled={isBacktesting}
              />
            )}
          </div>

          {/* Right Column - Results */}
          <div className="lg:col-span-2 space-y-6">
            <PerformanceDashboard results={results} />
            <ChartViewer data={data} results={results} />
            <TradeSignalOutput results={results} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;