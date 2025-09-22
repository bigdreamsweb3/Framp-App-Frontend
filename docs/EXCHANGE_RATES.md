# Exchange Rate System

This document describes the dynamic exchange rate system implemented for the FRAMP on-ramp interface.

## Overview

The exchange rate system fetches real-time cryptocurrency prices from CoinGecko API and converts them to NGN (Nigerian Naira) rates for display and calculations in the on-ramp interface.

## Architecture

### 1. Exchange Rate Service (`lib/services/exchangeRateService.ts`)

The core service that handles:
- Fetching token prices from CoinGecko API
- Converting USD prices to NGN using a fixed USD/NGN rate
- Caching rates for 5 minutes to avoid excessive API calls
- Supporting multiple tokens (SOL, USDT, USDC, BTC, ETH, etc.)

**Key Functions:**
- `getExchangeRate(tokenSymbol)` - Get rate for a single token
- `getExchangeRates(tokenSymbols)` - Get rates for multiple tokens
- `convertNGNToToken(ngnAmount, tokenSymbol, exchangeRate)` - Convert NGN to token amount
- `convertTokenToNGN(tokenAmount, tokenSymbol, exchangeRate)` - Convert token to NGN amount

### 2. React Hooks (`lib/hooks/useExchangeRate.ts`)

Custom hooks for managing exchange rates in React components:

**`useExchangeRate(tokenSymbol)`**
- Manages exchange rate for a single token
- Auto-refreshes every 5 minutes
- Provides loading and error states

**`useMultipleExchangeRates(tokenSymbols)`**
- Manages exchange rates for multiple tokens
- Useful for token selection interfaces

**`useExchangeRateWithFallback(tokenSymbol, fallbackRate)`**
- Same as `useExchangeRate` but with a fallback rate
- Ensures the UI always has a rate to display

### 3. UI Components

**`ExchangeRateStatus`** - Shows rate status with refresh button
**`ExchangeRateSkeleton`** - Loading skeleton for rate display
**`ExchangeRateError`** - Error display component

## Usage

### Basic Usage in Components

```tsx
import { useExchangeRateWithFallback } from '@/lib/hooks/useExchangeRate';

function MyComponent() {
  const {
    exchangeRate,
    loading,
    error,
    refreshRate,
    effectiveRate,
    convertNGNToToken,
  } = useExchangeRateWithFallback('SOL', 850);

  // Use effectiveRate for display
  // Use convertNGNToToken for calculations
}
```

### Supported Tokens

The system supports these tokens (mapped to CoinGecko IDs):
- SOL (Solana)
- USDT (Tether)
- USDC (USD Coin)
- BTC (Bitcoin)
- ETH (Ethereum)
- BNB (Binance Coin)
- ADA (Cardano)
- DOT (Polkadot)
- MATIC (Polygon)
- AVAX (Avalanche)

## Configuration

### USD to NGN Rate

Currently set to a fixed rate of 1500 NGN per USD in `exchangeRateService.ts`. To make this dynamic:

1. Create a currency API service
2. Update the `getUSDToNGNRate()` function
3. Use the dynamic rate in price calculations

### Cache Duration

Rates are cached for 5 minutes by default. To change this, modify `CACHE_DURATION` in `exchangeRateService.ts`.

### Auto-refresh Interval

Components auto-refresh rates every 5 minutes. To change this, modify the interval in the hooks.

## Error Handling

The system includes comprehensive error handling:

1. **Network Errors** - Falls back to cached rates
2. **API Errors** - Shows error status with retry option
3. **Unsupported Tokens** - Returns null gracefully
4. **Loading States** - Shows skeleton while fetching

## Testing

Run tests with:
```bash
npm test lib/services/__tests__/exchangeRateService.test.ts
```

## Future Improvements

1. **Dynamic USD/NGN Rate** - Fetch from currency API
2. **Multiple Price Sources** - Add fallback APIs
3. **Rate Alerts** - Notify users of significant rate changes
4. **Historical Rates** - Store and display rate history
5. **Rate Validation** - Cross-check rates from multiple sources

## API Limits

CoinGecko API has rate limits:
- Free tier: 10-50 calls/minute
- The system caches rates for 5 minutes to stay within limits

For production, consider upgrading to a paid CoinGecko plan or implementing multiple data sources.
