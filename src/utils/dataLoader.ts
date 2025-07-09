import { MarketData } from '../types/trading';

export async function loadCSVData(file: File): Promise<MarketData[]> {
  const text = await file.text();
  const lines = text.split('\n');
  const data: MarketData[] = [];
  
  // Skip header row
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line) {
      const cols = line.split(',');
      if (cols.length >= 6) {
        data.push({
          date: cols[0],
          open: parseFloat(cols[1]),
          high: parseFloat(cols[2]),
          low: parseFloat(cols[3]),
          close: parseFloat(cols[4]),
          volume: parseInt(cols[5])
        });
      }
    }
  }
  
  return data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

export async function fetchAlphaVantageData(symbol: string, apiKey: string): Promise<MarketData[]> {
  const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${apiKey}&outputsize=full`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    if (data['Error Message']) {
      throw new Error(data['Error Message']);
    }
    
    if (data['Note']) {
      throw new Error('API call frequency limit reached. Please try again later.');
    }
    
    const timeSeries = data['Time Series (Daily)'];
    if (!timeSeries) {
      throw new Error('Invalid response from Alpha Vantage API');
    }
    
    const marketData: MarketData[] = [];
    
    for (const [date, values] of Object.entries(timeSeries)) {
      const dayData = values as any;
      marketData.push({
        date,
        open: parseFloat(dayData['1. open']),
        high: parseFloat(dayData['2. high']),
        low: parseFloat(dayData['3. low']),
        close: parseFloat(dayData['4. close']),
        volume: parseInt(dayData['5. volume'])
      });
    }
    
    return marketData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  } catch (error) {
    console.error('Error fetching Alpha Vantage data:', error);
    throw error;
  }
}