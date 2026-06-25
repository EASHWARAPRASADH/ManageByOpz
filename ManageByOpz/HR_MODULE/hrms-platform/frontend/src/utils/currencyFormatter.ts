/**
 * Centralized Currency Formatter for HRMS Localization.
 * Configured for Indian Rupee (INR) with en-IN locale by default.
 */

export interface CurrencyConfig {
  locale: string;
  currency: string;
}

// Centralized configuration
let currentConfig: CurrencyConfig = {
  locale: 'en-IN',
  currency: 'INR',
};

/**
 * Configure the global currency formatting settings.
 */
export function configureCurrency(config: Partial<CurrencyConfig>) {
  currentConfig = { ...currentConfig, ...config };
}

/**
 * Get the current configuration.
 */
export function getCurrencyConfig(): CurrencyConfig {
  return currentConfig;
}

/**
 * Formats a numeric value into the localized currency string (e.g. ₹12,00,000).
 * Handles null/undefined/NaN gracefully.
 */
export function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value)) {
    return '';
  }

  try {
    return new Intl.NumberFormat(currentConfig.locale, {
      style: 'currency',
      currency: currentConfig.currency,
      maximumFractionDigits: 0, // CTC, budgets, and salaries are typically integers
    }).format(value);
  } catch (e) {
    console.error('[CurrencyFormatter] Error formatting currency:', e);
    // Fallback manual formatting if Intl fails
    return `₹${value.toLocaleString()}`;
  }
}

/**
 * Helper to get only the currency symbol (e.g. ₹).
 */
export function getCurrencySymbol(): string {
  try {
    const formatter = new Intl.NumberFormat(currentConfig.locale, {
      style: 'currency',
      currency: currentConfig.currency,
    });
    const parts = formatter.formatToParts(0);
    const symbolPart = parts.find(part => part.type === 'currency');
    return symbolPart ? symbolPart.value : '₹';
  } catch {
    return '₹';
  }
}
