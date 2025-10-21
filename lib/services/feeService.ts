// File: lib/services/feeService.ts

export interface FeeCalculation {
  serviceFee: number; // Fee amount in fiat (NGN)
  totalFee: number; // Same as serviceFee
  feeRate: number;
  netAmount: number; // Amount used to buy crypto (after fees)
  percentage: string;
  displayAmount: number;
  displayCurrency: string;
  cryptoAmount: number; // Actual crypto user receives
}

export interface FeeConfig {
  onramp: number; // 0.5% total
  offramp: number; // 0.1% total
  minimumFee: number; // Minimum fee in NGN
}

const DEFAULT_FEE_CONFIG: FeeConfig = {
  onramp: 0.005, // 0.5%
  offramp: 0.001, // 0.1%
  minimumFee: 50, // ₦50 minimum
};

export function calculateFees(
  amount: number,
  mode: "onramp" | "offramp",
  receiveAmount: number = 0,
  exchangeRate: number = 0,
  customConfig?: Partial<FeeConfig>
): FeeCalculation {
  const config = { ...DEFAULT_FEE_CONFIG, ...customConfig };
  const feeRate = config[mode];

  if (!amount || amount <= 0 || !exchangeRate) {
    return {
      serviceFee: 0,
      totalFee: 0,
      feeRate,
      netAmount: 0,
      percentage: `${feeRate * 100}%`,
      displayAmount: 0,
      displayCurrency: mode === "onramp" ? "NGN" : "TOKEN",
      cryptoAmount: 0,
    };
  }

  if (mode === "onramp") {
    // ONRAMP: Calculate fee in fiat and deduct from fiat amount
    let serviceFee = amount * feeRate;
    serviceFee = Math.max(serviceFee, config.minimumFee);

    // Amount actually used to buy crypto (after fee deduction)
    const netFiatAmount = amount - serviceFee;

    // Calculate crypto amount based on net fiat amount
    const cryptoAmount = netFiatAmount / exchangeRate;

    return {
      serviceFee: Math.round(serviceFee),
      totalFee: Math.round(serviceFee),
      feeRate,
      netAmount: netFiatAmount, // Fiat amount used for crypto purchase
      percentage: `${feeRate * 100}%`,
      displayAmount: amount,
      displayCurrency: "NGN",
      cryptoAmount: cryptoAmount, // Actual crypto user receives
    };
  } else {
    // OFFRAMP: Calculate fee in fiat first, then convert to crypto
    const cryptoValueInFiat = amount * exchangeRate;
    let serviceFeeInFiat = cryptoValueInFiat * feeRate;
    serviceFeeInFiat = Math.max(serviceFeeInFiat, config.minimumFee);

    const serviceFeeInCrypto = serviceFeeInFiat / exchangeRate;
    const netAmount = Math.max(receiveAmount - serviceFeeInFiat, 0);

    return {
      serviceFee: serviceFeeInCrypto, // Display in crypto
      totalFee: serviceFeeInCrypto,
      feeRate,
      netAmount, // Fiat amount user receives
      percentage: `${feeRate * 100}%`,
      displayAmount: amount,
      displayCurrency: "TOKEN",
      cryptoAmount: amount, // Crypto amount user sends
    };
  }
}
/**
 * Get fee configuration (useful for displaying rates)
 */
export function getFeeConfig(): FeeConfig {
  return { ...DEFAULT_FEE_CONFIG };
}

/**
 * Calculate fee for display purposes (percentage only)
 */
export function getFeePercentage(mode: "onramp" | "offramp"): string {
  const config = getFeeConfig();
  return `${config[mode] * 100}%`;
}
