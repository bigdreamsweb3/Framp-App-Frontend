// lib/hooks/useFees.ts
import { useMemo } from 'react';
import { calculateFees, getFeePercentage, type FeeCalculation } from '@/lib/services/feeService';

export function useFees(
  amount: number,
  mode: 'onramp' | 'offramp',
  receiveAmount: number = 0,
  exchangeRate: number = 0
): FeeCalculation {
  return useMemo(() => {
    return calculateFees(amount, mode, receiveAmount, exchangeRate);
  }, [amount, mode, receiveAmount, exchangeRate]);
}

export { getFeePercentage };