// File: lib/services/feeService.ts

export interface FeeCalculation {
  platformFee: number;
  processingFee: number; // Banking API fee
  totalFee: number;
  feeRate: number;
  netAmount: number;
  percentage: string;
  breakdown: {
    platform: { percentage: string; amount: number };
    processing: { percentage: string; amount: number };
  };
}

export interface FeeConfig {
  onramp: {
    total: number;      // 2% total
    platform: number;   // 0.5% platform fee
    processing: number; // 1.5% processing fee
  };
  offramp: {
    total: number;      // 1% total  
    platform: number;   // 0.5% platform fee
    processing: number; // 0.5% processing fee
  };
  minimumFee: number;
}

// Updated fee configuration with breakdown
const DEFAULT_FEE_CONFIG: FeeConfig = {
  onramp: {
    total: 0.02,    // 2% total
    platform: 0.005, // 0.5% platform
    processing: 0.015 // 1.5% processing
  },
  offramp: {
    total: 0.01,    // 1% total
    platform: 0.005, // 0.5% platform  
    processing: 0.005 // 0.5% processing
  },
  minimumFee: 50
};

/**
 * Calculate fees for ramp transactions with breakdown
 */

export function calculateFees(
  amount: number,
  mode: "onramp" | "offramp",
  receiveAmount: number = 0,
  customConfig?: Partial<FeeConfig>
): FeeCalculation {
  const config = { ...DEFAULT_FEE_CONFIG, ...customConfig };
  const feeConfig = config[mode];

  if (!amount || amount <= 0) {
    return {
      platformFee: 0,
      processingFee: 0,
      totalFee: 0,
      feeRate: feeConfig.total,
      netAmount: receiveAmount,
      percentage: `${feeConfig.total * 100}%`,
      breakdown: {
        platform: { percentage: `${feeConfig.platform * 100}%`, amount: 0 },
        processing: { percentage: `${feeConfig.processing * 100}%`, amount: 0 }
      }
    };
  }

  // Calculate individual fees based on input amount
  let platformFee = amount * feeConfig.platform;
  let processingFee = amount * feeConfig.processing;
  
  // Apply minimum fee to total
  const totalCalculatedFee = platformFee + processingFee;
  const totalFee = Math.max(totalCalculatedFee, config.minimumFee);
  
  // If minimum fee applies, distribute proportionally
  if (totalCalculatedFee < config.minimumFee) {
    const ratio = config.minimumFee / totalCalculatedFee;
    platformFee = platformFee * ratio;
    processingFee = processingFee * ratio;
  }

  // Round fees
  platformFee = Math.round(platformFee);
  processingFee = Math.round(processingFee);

  // For onramp: user pays fee in fiat, receives full crypto amount
  // For offramp: user pays fee from fiat amount they receive
  const netAmount =
    mode === "onramp"
      ? receiveAmount
      : Math.max(receiveAmount - totalFee, 0);

  return {
    platformFee,
    processingFee,
    totalFee,
    feeRate: feeConfig.total,
    netAmount,
    percentage: `${feeConfig.total * 100}%`,
    breakdown: {
      platform: { 
        percentage: `${feeConfig.platform * 100}%`, 
        amount: platformFee 
      },
      processing: { 
        percentage: `${feeConfig.processing * 100}%`, 
        amount: processingFee 
      }
    }
  };
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
  return `${config[mode].total * 100}%`;
}