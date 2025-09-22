// File: lib/hooks/useExchangeRate.ts

import { useState, useEffect, useCallback } from 'react';
import { 
  getExchangeRate, 
  getExchangeRates, 
  ExchangeRate, 
  convertNGNToToken,
  convertTokenToNGN 
} from '@/lib/api/exchangeRateApi';

interface UseExchangeRateReturn {
  exchangeRate: ExchangeRate | null;
  loading: boolean;
  error: string | null;
  refreshRate: () => Promise<void>;
  convertNGNToToken: (ngnAmount: number) => number;
  convertTokenToNGN: (tokenAmount: number) => number;
}

interface UseMultipleExchangeRatesReturn {
  exchangeRates: Map<string, ExchangeRate>;
  loading: boolean;
  error: string | null;
  refreshRates: () => Promise<void>;
  getRate: (tokenSymbol: string) => ExchangeRate | null;
}

/**
 * Hook for managing exchange rate for a single token
 */
export function useExchangeRate(tokenSymbol: string): UseExchangeRateReturn {
  const [exchangeRate, setExchangeRate] = useState<ExchangeRate | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRate = useCallback(async () => {
    if (!tokenSymbol) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const rate = await getExchangeRate(tokenSymbol);
      setExchangeRate(rate);
      if (!rate) {
        setError(`Failed to fetch exchange rate for ${tokenSymbol}`);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(`Error fetching exchange rate: ${errorMessage}`);
      console.error('Exchange rate fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [tokenSymbol]);

  // Fetch rate on mount and when token changes
  useEffect(() => {
    fetchRate();
  }, [fetchRate]);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    if (!tokenSymbol) return;
    
    const interval = setInterval(fetchRate, 5 * 60 * 1000); // 5 minutes
    return () => clearInterval(interval);
  }, [fetchRate, tokenSymbol]);

  const convertNGNToTokenAmount = useCallback((ngnAmount: number) => {
    return convertNGNToToken(ngnAmount, tokenSymbol, exchangeRate || undefined);
  }, [tokenSymbol, exchangeRate]);

  const convertTokenToNGNAmount = useCallback((tokenAmount: number) => {
    return convertTokenToNGN(tokenAmount, tokenSymbol, exchangeRate || undefined);
  }, [tokenSymbol, exchangeRate]);

  return {
    exchangeRate,
    loading,
    error,
    refreshRate: fetchRate,
    convertNGNToToken: convertNGNToTokenAmount,
    convertTokenToNGN: convertTokenToNGNAmount,
  };
}

/**
 * Hook for managing exchange rates for multiple tokens
 */
export function useMultipleExchangeRates(tokenSymbols: string[]): UseMultipleExchangeRatesReturn {
  const [exchangeRates, setExchangeRates] = useState<Map<string, ExchangeRate>>(new Map());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRates = useCallback(async () => {
    if (tokenSymbols.length === 0) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const rates = await getExchangeRates(tokenSymbols);
      const ratesMap = new Map<string, ExchangeRate>();
      
      rates.forEach(rate => {
        ratesMap.set(rate.token, rate);
      });
      
      setExchangeRates(ratesMap);
      
      if (rates.length === 0) {
        setError('Failed to fetch any exchange rates');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(`Error fetching exchange rates: ${errorMessage}`);
      console.error('Exchange rates fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [tokenSymbols]);

  // Fetch rates on mount and when tokens change
  useEffect(() => {
    fetchRates();
  }, [fetchRates]);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    if (tokenSymbols.length === 0) return;
    
    const interval = setInterval(fetchRates, 5 * 60 * 1000); // 5 minutes
    return () => clearInterval(interval);
  }, [fetchRates, tokenSymbols]);

  const getRate = useCallback((tokenSymbol: string) => {
    return exchangeRates.get(tokenSymbol.toUpperCase()) || null;
  }, [exchangeRates]);

  return {
    exchangeRates,
    loading,
    error,
    refreshRates: fetchRates,
    getRate,
  };
}

/**
 * Hook for getting exchange rate with fallback to default rate
 */
export function useExchangeRateWithFallback(
  tokenSymbol: string, 
  fallbackRate: number = 850
): UseExchangeRateReturn & { effectiveRate: number } {
  const exchangeRateHook = useExchangeRate(tokenSymbol);
  
  const effectiveRate = exchangeRateHook.exchangeRate?.rate || fallbackRate;
  
  const convertNGNToTokenAmount = useCallback((ngnAmount: number) => {
    return ngnAmount / effectiveRate;
  }, [effectiveRate]);

  const convertTokenToNGNAmount = useCallback((tokenAmount: number) => {
    return tokenAmount * effectiveRate;
  }, [effectiveRate]);

  return {
    ...exchangeRateHook,
    effectiveRate,
    convertNGNToToken: convertNGNToTokenAmount,
    convertTokenToNGN: convertTokenToNGNAmount,
  };
}
