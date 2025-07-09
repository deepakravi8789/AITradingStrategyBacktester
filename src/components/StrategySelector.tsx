import React from 'react';
import { Settings, TrendingUp, BarChart3, Zap } from 'lucide-react';
import { StrategyConfig } from '../types/trading';
import { AVAILABLE_STRATEGIES } from '../utils/strategies';

interface StrategySelectorProps {
  config: StrategyConfig;
  onChange: (config: StrategyConfig) => void;
  disabled?: boolean;
}

const STRATEGY_ICONS = {
  'SMA Crossover': TrendingUp,
  'RSI Strategy': BarChart3,
  'Momentum Strategy': Zap,
};

export default function StrategySelector({ config, onChange, disabled }: StrategySelectorProps) {
  const strategyNames = Object.keys(AVAILABLE_STRATEGIES);
  
  const handleStrategyChange = (strategyName: string) => {
    const strategy = AVAILABLE_STRATEGIES[strategyName as keyof typeof AVAILABLE_STRATEGIES];
    const defaultParameters: Record<string, number> = {};
    
    Object.entries(strategy.parameters).forEach(([key, param]) => {
      defaultParameters[key] = param.default;
    });
    
    onChange({
      name: strategyName,
      parameters: defaultParameters
    });
  };

  const handleParameterChange = (paramName: string, value: number) => {
    onChange({
      ...config,
      parameters: {
        ...config.parameters,
        [paramName]: value
      }
    });
  };

  const currentStrategy = AVAILABLE_STRATEGIES[config.name as keyof typeof AVAILABLE_STRATEGIES];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
        <Settings size={20} />
        <span>Strategy Configuration</span>
      </h2>

      {/* Strategy Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Trading Strategy
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {strategyNames.map((strategyName) => {
            const Icon = STRATEGY_ICONS[strategyName as keyof typeof STRATEGY_ICONS];
            return (
              <button
                key={strategyName}
                onClick={() => handleStrategyChange(strategyName)}
                disabled={disabled}
                className={`flex items-center space-x-2 p-3 rounded-lg border transition-colors ${
                  config.name === strategyName
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <Icon size={18} />
                <span className="text-sm font-medium">{strategyName}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Parameter Configuration */}
      {currentStrategy && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Parameters</h3>
          {Object.entries(currentStrategy.parameters).map(([paramName, param]) => (
            <div key={paramName} className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {paramName.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                <span className="text-blue-600 dark:text-blue-400 ml-1">
                  ({config.parameters[paramName]})
                </span>
              </label>
              <input
                type="range"
                min={param.min}
                max={param.max}
                step={param.step}
                value={config.parameters[paramName]}
                onChange={(e) => handleParameterChange(paramName, parseFloat(e.target.value))}
                disabled={disabled}
                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>{param.min}</span>
                <span>{param.max}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}