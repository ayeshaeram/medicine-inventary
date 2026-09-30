/**
 * Standard Indian Rupee (INR - ₹) Currency Formatting Utilities
 */

export const CURRENCY_SYMBOL = '₹';
export const CURRENCY_CODE = 'INR';

export function formatINR(val: number | null | undefined): string {
  if (val === null || val === undefined || isNaN(val)) return '₹0';
  return `₹${Math.round(val).toLocaleString('en-IN')}`;
}

export function formatINRDecimal(val: number | null | undefined, decimals = 2): string {
  if (val === null || val === undefined || isNaN(val)) return '₹0.00';
  return `₹${Number(val).toLocaleString('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  })}`;
}
