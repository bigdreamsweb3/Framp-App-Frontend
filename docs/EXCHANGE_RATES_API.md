# Exchange Rates API

This document describes the backend exchange rates API that replaced the frontend exchange rate service.

## Overview

The exchange rates are now fetched from the backend API instead of directly from CoinGecko in the frontend. This provides better caching, error handling, and security.

## API Endpoints

### GET /api/exchange-rates?token=SOL

Get exchange rate for a single token.

**Query Parameters:**
- `token` (required): Token symbol (e.g., SOL, USDT, BTC)

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "SOL",
    "rate": 150000,
    "lastUpdated": 1703123456789,
    "source": "CoinGecko"
  }
}
```

### GET /api/exchange-rates?tokens=SOL,USDT,BTC

Get exchange rates for multiple tokens.

**Query Parameters:**
- `tokens` (required): Comma-separated list of token symbols

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "token": "SOL",
      "rate": 150000,
      "lastUpdated": 1703123456789,
      "source": "CoinGecko"
    },
    {
      "token": "USDT",
      "rate": 1500,
      "lastUpdated": 1703123456789,
      "source": "CoinGecko"
    }
  ]
}
```

### POST /api/exchange-rates

Get exchange rates for multiple tokens using request body.

**Request Body:**
```json
{
  "tokens": ["SOL", "USDT", "BTC"]
}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "token": "SOL",
      "rate": 150000,
      "lastUpdated": 1703123456789,
      "source": "CoinGecko"
    }
  ]
}
```

## Frontend Usage

### Single Token
```typescript
import { getExchangeRate } from '@/lib/services/exchangeRateApi';

const rate = await getExchangeRate('SOL');
if (rate) {
  console.log(`1 SOL = ${rate.rate} NGN`);
}
```

### Multiple Tokens
```typescript
import { getExchangeRates } from '@/lib/services/exchangeRateApi';

const rates = await getExchangeRates(['SOL', 'USDT', 'BTC']);
rates.forEach(rate => {
  console.log(`1 ${rate.token} = ${rate.rate} NGN`);
});
```

### React Hook
```typescript
import { useExchangeRateWithFallback } from '@/lib/hooks/useExchangeRate';

function MyComponent() {
  const {
    exchangeRate,
    loading,
    error,
    effectiveRate,
    convertNGNToToken
  } = useExchangeRateWithFallback('SOL', 850);

  // Use effectiveRate for display
  // Use convertNGNToToken for calculations
}
```

## Backend Features

### Caching
- Rates are cached for 5 minutes to reduce API calls
- Expired cached rates are returned as fallback if API fails

### Error Handling
- Comprehensive error logging
- Graceful fallbacks to cached data
- Proper HTTP status codes

### Supported Tokens
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

## Migration Notes

The frontend exchange rate service has been completely replaced:
- ✅ Backend API endpoint created
- ✅ Frontend service updated to use API
- ✅ React hooks updated
- ✅ Old frontend service removed
- ✅ Tests updated

## Benefits

1. **Better Performance**: Server-side caching reduces API calls
2. **Security**: API keys and external calls happen on backend
3. **Reliability**: Better error handling and fallbacks
4. **Scalability**: Centralized rate management
5. **Consistency**: All clients get the same rates
