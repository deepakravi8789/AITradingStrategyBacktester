import React, { useEffect, useRef } from 'react';
import { TrendingUp, Circle } from 'lucide-react';
import { MarketData, BacktestResults } from '../types/trading';

interface ChartViewerProps {
  data: MarketData[];
  results: BacktestResults | null;
}

export default function ChartViewer({ data, results }: ChartViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const equityCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!data.length || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth * 2;
    canvas.height = canvas.offsetHeight * 2;
    ctx.scale(2, 2);

    const width = canvas.offsetWidth;
    const height = canvas.offsetHeight;
    const padding = 40;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Calculate price range
    const prices = data.map(d => [d.high, d.low]).flat();
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceRange = maxPrice - minPrice;

    // Draw candlesticks
    const candleWidth = Math.max(2, (width - padding * 2) / data.length - 1);
    
    data.forEach((candle, index) => {
      const x = padding + (index * (width - padding * 2)) / data.length;
      const openY = height - padding - ((candle.open - minPrice) / priceRange) * (height - padding * 2);
      const closeY = height - padding - ((candle.close - minPrice) / priceRange) * (height - padding * 2);
      const highY = height - padding - ((candle.high - minPrice) / priceRange) * (height - padding * 2);
      const lowY = height - padding - ((candle.low - minPrice) / priceRange) * (height - padding * 2);

      // Draw wick
      ctx.strokeStyle = '#666';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x + candleWidth / 2, highY);
      ctx.lineTo(x + candleWidth / 2, lowY);
      ctx.stroke();

      // Draw body
      const bodyColor = candle.close > candle.open ? '#10B981' : '#EF4444';
      ctx.fillStyle = bodyColor;
      ctx.fillRect(x, Math.min(openY, closeY), candleWidth, Math.abs(closeY - openY));
    });

    // Draw buy/sell signals
    if (results?.signals) {
      results.signals.forEach(signal => {
        const dataIndex = data.findIndex(d => d.date === signal.date);
        if (dataIndex === -1) return;

        const x = padding + (dataIndex * (width - padding * 2)) / data.length;
        const y = height - padding - ((signal.price - minPrice) / priceRange) * (height - padding * 2);

        ctx.fillStyle = signal.type === 'buy' ? '#10B981' : '#EF4444';
        ctx.beginPath();
        ctx.arc(x + candleWidth / 2, y, 4, 0, 2 * Math.PI);
        ctx.fill();

        // Draw signal label
        ctx.fillStyle = '#FFF';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(signal.type.toUpperCase(), x + candleWidth / 2, y - 8);
      });
    }

    // Draw price axis
    ctx.strokeStyle = '#E5E7EB';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, height - padding);
    ctx.lineTo(width - padding, height - padding);
    ctx.stroke();

    // Draw price labels
    ctx.fillStyle = '#6B7280';
    ctx.font = '12px Arial';
    ctx.textAlign = 'right';
    for (let i = 0; i <= 5; i++) {
      const price = minPrice + (priceRange * i) / 5;
      const y = height - padding - (i * (height - padding * 2)) / 5;
      ctx.fillText(price.toFixed(2), padding - 5, y + 4);
    }

  }, [data, results]);

  useEffect(() => {
    if (!results?.equityCurve.length || !equityCanvasRef.current) return;
    
    const canvas = equityCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth * 2;
    canvas.height = canvas.offsetHeight * 2;
    ctx.scale(2, 2);

    const width = canvas.offsetWidth;
    const height = canvas.offsetHeight;
    const padding = 40;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    const equity = results.equityCurve;
    const values = equity.map(e => e.value);
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const valueRange = maxValue - minValue;

    // Draw equity curve
    ctx.strokeStyle = '#3B82F6';
    ctx.lineWidth = 2;
    ctx.beginPath();

    equity.forEach((point, index) => {
      const x = padding + (index * (width - padding * 2)) / (equity.length - 1);
      const y = height - padding - ((point.value - minValue) / valueRange) * (height - padding * 2);
      
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.stroke();

    // Draw axes
    ctx.strokeStyle = '#E5E7EB';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, height - padding);
    ctx.lineTo(width - padding, height - padding);
    ctx.stroke();

    // Draw value labels
    ctx.fillStyle = '#6B7280';
    ctx.font = '12px Arial';
    ctx.textAlign = 'right';
    for (let i = 0; i <= 5; i++) {
      const value = minValue + (valueRange * i) / 5;
      const y = height - padding - (i * (height - padding * 2)) / 5;
      ctx.fillText(`$${value.toFixed(0)}`, padding - 5, y + 4);
    }

  }, [results]);

  if (!data.length) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Chart Viewer</h2>
        <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
          <p>Load data to view charts</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
        <TrendingUp size={20} />
        <span>Chart Viewer</span>
      </h2>

      <div className="space-y-6">
        {/* Price Chart */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Price Chart with Signals</h3>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <canvas
              ref={canvasRef}
              className="w-full h-64 border rounded"
              style={{ imageRendering: 'pixelated' }}
            />
          </div>
          <div className="flex items-center justify-center mt-2 space-x-6">
            <div className="flex items-center space-x-2">
              <Circle className="w-3 h-3 text-green-500 fill-current" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Buy Signal</span>
            </div>
            <div className="flex items-center space-x-2">
              <Circle className="w-3 h-3 text-red-500 fill-current" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Sell Signal</span>
            </div>
          </div>
        </div>

        {/* Equity Curve */}
        {results && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Equity Curve</h3>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <canvas
                ref={equityCanvasRef}
                className="w-full h-48 border rounded"
                style={{ imageRendering: 'pixelated' }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}