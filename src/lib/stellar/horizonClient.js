const HORIZON_URL = process.env.NEXT_PUBLIC_STELLAR_HORIZON_URL || "https://horizon-testnet.stellar.org";

/**
 * Fetch current network fee statistics from Horizon endpoint /fee_stats.
 * @returns {Promise<Object>} Fee statistics object
 */
export async function getFeeStats() {
  try {
    const response = await fetch(`${HORIZON_URL}/fee_stats`, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch fee stats: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching Stellar fee stats:", error);
    // Fallback to minimal defaults in case of error
    return {
      fee_charged: {
        min: "100",
        p10: "100",
        p20: "100",
        p30: "100",
        p40: "100",
        p50: "100",
        p60: "100",
        p70: "100",
        p80: "100",
        p90: "100",
        p95: "100",
        p99: "100",
        max: "100",
      },
    };
  }
}

/**
 * Calculate optimal base fee rates based on network congestion.
 * @param {Object} feeStats - The fee statistics object from getFeeStats
 * @returns {Object} Optimal fee rates { low, medium, high } in stroops
 */
export function calculateOptimalFees(feeStats) {
  const p10 = parseInt(feeStats.fee_charged?.p10 || "100", 10);
  const p50 = parseInt(feeStats.fee_charged?.p50 || "100", 10);
  const p95 = parseInt(feeStats.fee_charged?.p95 || "100", 10);

  return {
    low: String(Math.max(100, p10)),
    medium: String(Math.max(100, p50)),
    high: String(Math.max(100, p95)),
  };
}

/**
 * Get the dynamic optimal fee for a given priority tier.
 * @param {'low' | 'medium' | 'high'} tier - Priority tier
 * @returns {Promise<string>} Base fee string in stroops
 */
export async function getDynamicBaseFee(tier = 'medium') {
  const feeStats = await getFeeStats();
  const optimalFees = calculateOptimalFees(feeStats);
  
  return optimalFees[tier] || optimalFees.medium;
}
