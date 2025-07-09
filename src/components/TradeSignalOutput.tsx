import React, { useState } from 'react';
import { Download, Code, Copy, CheckCircle } from 'lucide-react';
import { BacktestResults } from '../types/trading';

interface TradeSignalOutputProps {
  results: BacktestResults | null;
}

export default function TradeSignalOutput({ results }: TradeSignalOutputProps) {
  const [format, setFormat] = useState<'json' | 'csv'>('json');
  const [copied, setCopied] = useState(false);

  const generateOutput = () => {
    if (!results) return '';

    const signals = results.signals.map(signal => ({
      timestamp: signal.date,
      action: signal.type,
      price: signal.price,
      quantity: signal.quantity,
      strategy: signal.strategy,
      confidence: signal.confidence || 0
    }));

    if (format === 'json') {
      return JSON.stringify({
        metadata: {
          strategy: results.signals[0]?.strategy || 'Unknown',
          total_signals: signals.length,
          performance: results.performance,
          generated_at: new Date().toISOString()
        },
        signals
      }, null, 2);
    } else {
      const csvHeader = 'timestamp,action,price,quantity,strategy,confidence\n';
      const csvRows = signals.map(signal => 
        `${signal.timestamp},${signal.action},${signal.price},${signal.quantity},${signal.strategy},${signal.confidence}`
      ).join('\n');
      return csvHeader + csvRows;
    }
  };

  const handleCopy = async () => {
    const output = generateOutput();
    if (output) {
      try {
        await navigator.clipboard.writeText(output);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy to clipboard:', err);
      }
    }
  };

  const handleDownload = () => {
    const output = generateOutput();
    if (!output) return;

    const blob = new Blob([output], { type: format === 'json' ? 'application/json' : 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trade-signals.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const output = generateOutput();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
        <Code size={20} />
        <span>Trade Signal Output</span>
      </h2>

      {!results ? (
        <div className="flex items-center justify-center h-32 text-gray-500 dark:text-gray-400">
          <p>Run a backtest to generate trade signals</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Format Selection */}
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Output Format:
            </label>
            <div className="flex space-x-2">
              <button
                onClick={() => setFormat('json')}
                className={`px-3 py-1 rounded text-sm ${
                  format === 'json'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                JSON
              </button>
              <button
                onClick={() => setFormat('csv')}
                className={`px-3 py-1 rounded text-sm ${
                  format === 'csv'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                CSV
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2">
            <button
              onClick={handleCopy}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-md transition-colors"
            >
              {copied ? <CheckCircle size={16} /> : <Copy size={16} />}
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors"
            >
              <Download size={16} />
              <span>Download</span>
            </button>
          </div>

          {/* Output Preview */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Preview ({results.signals.length} signals)
            </h3>
            <pre className="text-xs text-gray-600 dark:text-gray-400 max-h-64 overflow-y-auto bg-white dark:bg-gray-800 p-3 rounded border">
              {output}
            </pre>
          </div>

          {/* Webhook Integration Info */}
          <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-2">
              Webhook Integration
            </h3>
            <p className="text-xs text-blue-600 dark:text-blue-400 mb-2">
              You can integrate these signals with your trading platform using webhooks:
            </p>
            <code className="text-xs bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
              POST /webhook/signals
            </code>
          </div>
        </div>
      )}
    </div>
  );
}