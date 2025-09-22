// File: lib/api/exchangeRateApi.ts

export interface ExchangeRate {
  token: string;
  rate: number; // Rate in NGN per token
  lastUpdated: number;
  source: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://framp-backend.vercel.app";

/**
 * Get exchange rate for a single token from backend API
 */
export async function getExchangeRate(tokenSymbol: string): Promise<ExchangeRate | null> {
  try {
    const response = await fetch(`${API_BASE}/api/exchange-rates?token=${tokenSymbol}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch exchange rate');
    }

    return data.data;
  } catch (error) {
    console.error(`Error fetching exchange rate for ${tokenSymbol}:`, error);
    return null;
  }
}

/**
 * Get exchange rates for multiple tokens from backend API
 */
export async function getExchangeRates(tokenSymbols: string[]): Promise<ExchangeRate[]> {
  try {
    const response = await fetch(`${API_BASE}/api/exchange-rates`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ tokens: tokenSymbols }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch exchange rates');
    }

    return data.data;
  } catch (error) {
    console.error('Error fetching exchange rates:', error);
    return [];
  }
}

/**
 * Convert amount from NGN to token amount
 */
export function convertNGNToToken(ngnAmount: number, tokenSymbol: string, exchangeRate?: ExchangeRate): number {
  if (!exchangeRate) {
    console.warn(`No exchange rate available for ${tokenSymbol}`);
    return 0;
  }
  
  return ngnAmount / exchangeRate.rate;
}

/**
 * Convert amount from token to NGN
 */
export function convertTokenToNGN(tokenAmount: number, tokenSymbol: string, exchangeRate?: ExchangeRate): number {
  if (!exchangeRate) {
    console.warn(`No exchange rate available for ${tokenSymbol}`);
    return 0;
  }
  
  return tokenAmount * exchangeRate.rate;
}