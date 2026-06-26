const NL = 'nl-BE';

/**
 * Format a currency amount with proper sign prefix.
 * Negative: -€1.344,56  Positive: €3.630,00
 */
export const fmt = (n, decimals = 2) =>
  (n < 0 ? '-' : '') + '€' +
  Math.abs(n).toLocaleString(NL, { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

/**
 * Same but always shows sign: +€3.630,00 / -€1.344,56
 */
export const fmtSigned = (n, decimals = 2) =>
  (n >= 0 ? '+' : '-') + '€' +
  Math.abs(n).toLocaleString(NL, { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

/**
 * No decimals variant (for large totals like net worth).
 */
export const fmtInt = (n) => fmt(n, 0);
