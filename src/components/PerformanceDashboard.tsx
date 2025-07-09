import React from 'react';
import { TrendingUp, TrendingDown, Target, Award, DollarSign, AlertTriangle } from 'lucide-react';
import { BacktestResults } from '../types/trading';

interface PerformanceDashboardProps {
  results: BacktestResults | null;
}

export default function PerformanceDashboard({ results }: PerformanceDashboardProps) {
  if (!results) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Performance Dashboard</h2>
        <div className="flex items-center justify-center h-32 text-gray-500 dark:text-gray-400">
          <p>Run a backtest to see performance metrics</p>
        </div>
      </div>
    );
  }

  const { performance } = results;

  const metrics = [
    {
      label: 'Total Return',
      value: `${performance.totalReturn.toFixed(2)}%`,
      icon: performance.totalReturn >= 0 ? TrendingUp : TrendingDown,
      color: performance.totalReturn >= 0 ? 'text-green-600' : 'text-red-600',
      bgColor: performance.totalReturn >= 0 ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'
    },
    {
      label: 'Sharpe Ratio',
      value: performance.sharpeRatio.toFixed(2),
      icon: Award,
      color: performance.sharpeRatio >= 1 ? 'text-green-600' : performance.sharpeRatio >= 0.5 ? 'text-yellow-600' : 'text-red-600',
      bgColor: performance.sharpeRatio >= 1 ? 'bg-green-100 dark:bg-green-900' : performance.sharpeRatio >= 0.5 ? 'bg-yellow-100 dark:bg-yellow-900' : 'bg-red-100 dark:bg-red-900'
    },
    {
      label: 'Win Rate',
      value: `${performance.winRate.toFixed(1)}%`,
      icon: Target,
      color: performance.winRate >= 60 ? 'text-green-600' : performance.winRate >= 40 ? 'text-yellow-600' : 'text-red-600',
      bgColor: performance.winRate >= 60 ? 'bg-green-100 dark:bg-green-900' : performance.winRate >= 40 ? 'bg-yellow-100 dark:bg-yellow-900' : 'bg-red-100 dark:bg-red-900'
    },
    {
      label: 'Max Drawdown',
      value: `${performance.maxDrawdown.toFixed(2)}%`,
      icon: AlertTriangle,
      color: performance.maxDrawdown <= 10 ? 'text-green-600' : performance.maxDrawdown <= 20 ? 'text-yellow-600' : 'text-red-600',
      bgColor: performance.maxDrawdown <= 10 ? 'bg-green-100 dark:bg-green-900' : performance.maxDrawdown <= 20 ? 'bg-yellow-100 dark:bg-yellow-900' : 'bg-red-100 dark:bg-red-900'
    },
    {
      label: 'Profit Factor',
      value: performance.profitFactor === Infinity ? '∞' : performance.profitFactor.toFixed(2),
      icon: DollarSign,
      color: performance.profitFactor >= 2 ? 'text-green-600' : performance.profitFactor >= 1 ? 'text-yellow-600' : 'text-red-600',
      bgColor: performance.profitFactor >= 2 ? 'bg-green-100 dark:bg-green-900' : performance.profitFactor >= 1 ? 'bg-yellow-100 dark:bg-yellow-900' : 'bg-red-100 dark:bg-red-900'
    },
    {
      label: 'Total Trades',
      value: performance.totalTrades.toString(),
      icon: TrendingUp,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900'
    }
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Performance Dashboard</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <div key={metric.label} className={`p-4 rounded-lg ${metric.bgColor}`}>
              <div className="flex items-center space-x-3">
                <Icon className={`w-8 h-8 ${metric.color}`} />
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{metric.label}</p>
                  <p className={`text-2xl font-bold ${metric.color}`}>{metric.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Trading Statistics</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Winning Trades:</span>
              <span className="font-medium text-green-600">{performance.winningTrades}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Losing Trades:</span>
              <span className="font-medium text-red-600">{performance.losingTrades}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Average Win:</span>
              <span className="font-medium text-green-600">${performance.averageWin.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Average Loss:</span>
              <span className="font-medium text-red-600">${performance.averageLoss.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Risk Metrics</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Sharpe Ratio:</span>
              <span className="font-medium">{performance.sharpeRatio.toFixed(3)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Max Drawdown:</span>
              <span className="font-medium text-red-600">{performance.maxDrawdown.toFixed(2)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Win Rate:</span>
              <span className="font-medium">{performance.winRate.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Profit Factor:</span>
              <span className="font-medium">
                {performance.profitFactor === Infinity ? '∞' : performance.profitFactor.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}