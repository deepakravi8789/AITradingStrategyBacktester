import React, { useState } from 'react';
import { Upload, TrendingUp, AlertCircle } from 'lucide-react';
import { MarketData } from '../types/trading';
import { loadCSVData, fetchAlphaVantageData } from '../utils/dataLoader';

interface DataInputProps {
  onDataLoaded: (data: MarketData[]) => void;
  loading: boolean;
}

const ALPHA_VANTAGE_API_KEY = 'L5MGYDFNE94YJ4Q4';

export default function DataInput({ onDataLoaded, loading }: DataInputProps) {
  const [inputMethod, setInputMethod] = useState<'csv' | 'api'>('api');
  const [symbol, setSymbol] = useState('AAPL');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setError(null);

    try {
      const data = await loadCSVData(file);
      if (data.length === 0) {
        throw new Error('No valid data found in CSV file');
      }
      onDataLoaded(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load CSV data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAPIFetch = async () => {
    if (!symbol.trim()) {
      setError('Please enter a valid symbol');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await fetchAlphaVantageData(symbol.toUpperCase(), ALPHA_VANTAGE_API_KEY);
      if (data.length === 0) {
        throw new Error('No data received from API');
      }
      onDataLoaded(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data from API');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Data Input</h2>
      
      {/* Input Method Toggle */}
      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => setInputMethod('api')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
            inputMethod === 'api'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
          }`}
        >
          <TrendingUp size={18} />
          <span>API Fetch</span>
        </button>
        <button
          onClick={() => setInputMethod('csv')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
            inputMethod === 'csv'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
          }`}
        >
          <Upload size={18} />
          <span>Upload CSV</span>
        </button>
      </div>

      {/* API Fetch */}
      {inputMethod === 'api' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Stock Symbol
            </label>
            <input
              type="text"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              placeholder="e.g., AAPL, GOOGL, MSFT"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              disabled={isLoading || loading}
            />
          </div>
          <button
            onClick={handleAPIFetch}
            disabled={isLoading || loading}
            className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white py-2 px-4 rounded-md transition-colors flex items-center justify-center space-x-2"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                <span>Fetching...</span>
              </>
            ) : (
              <>
                <TrendingUp size={18} />
                <span>Fetch Data</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* CSV Upload */}
      {inputMethod === 'csv' && (
        <div className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
              id="csv-upload"
              disabled={isLoading || loading}
            />
            <label
              htmlFor="csv-upload"
              className="flex flex-col items-center justify-center cursor-pointer"
            >
              <Upload className="w-12 h-12 text-gray-400 mb-2" />
              <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                Click to upload CSV file
                <br />
                <span className="text-xs">Format: Date, Open, High, Low, Close, Volume</span>
              </p>
            </label>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mt-4 p-3 bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700 rounded-md flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <span className="text-sm text-red-700 dark:text-red-300">{error}</span>
        </div>
      )}
    </div>
  );
}