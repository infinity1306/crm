/**
 * Indian Numbering System Utility
 * Formats numbers and currency using the Indian grouping convention:
 * 1,00,000 (1 Lakh), 1,00,00,000 (1 Crore) instead of Western millions/thousands (k/M).
 */

/**
 * Format an amount in Indian Rupees (₹)
 * @param amount Number to format
 * @param compact If true, formats numbers >= 1 Lakh as 'L' and >= 1 Crore as 'Cr'. Smaller numbers are grouped with commas.
 */
export function formatINR(
  amount: number | undefined | null,
  options?: { compact?: boolean; precision?: number; showSymbol?: boolean }
): string {
  const val = Number(amount) || 0;
  const showSymbol = options?.showSymbol !== false;
  const symbol = showSymbol ? '₹' : '';

  if (options?.compact) {
    const absVal = Math.abs(val);
    const sign = val < 0 ? '-' : '';

    if (absVal >= 10000000) {
      const cr = absVal / 10000000;
      const formatted = cr >= 10 ? cr.toFixed(1) : cr.toFixed(2);
      return `${sign}${symbol}${formatted.replace(/\.0+$/, '')} Cr`;
    }

    if (absVal >= 100000) {
      const l = absVal / 100000;
      const formatted = l >= 10 ? l.toFixed(1) : l.toFixed(2);
      return `${sign}${symbol}${formatted.replace(/\.0+$/, '')}L`;
    }

    // Under 1 Lakh: full Indian comma format (e.g. ₹50,000, ₹8,500)
    return `${sign}${symbol}${Math.round(absVal).toLocaleString('en-IN')}`;
  }

  // Full Indian grouping: e.g. ₹1,25,000
  return `${symbol}${Math.round(val).toLocaleString('en-IN')}`;
}

/**
 * Formats a plain number with Indian comma grouping (XX,XX,XXX)
 */
export function formatIndianNumber(num: number | undefined | null): string {
  return (Number(num) || 0).toLocaleString('en-IN');
}

/**
 * Formats a count or generic quantity into Indian compact format (L / Cr for large counts)
 */
export function formatIndianCount(num: number | undefined | null): string {
  const val = Number(num) || 0;
  const abs = Math.abs(val);
  const sign = val < 0 ? '-' : '';

  if (abs >= 10000000) {
    return `${sign}${(abs / 10000000).toFixed(1)} Cr`;
  }
  if (abs >= 100000) {
    return `${sign}${(abs / 100000).toFixed(1)}L`;
  }
  return `${sign}${abs.toLocaleString('en-IN')}`;
}
