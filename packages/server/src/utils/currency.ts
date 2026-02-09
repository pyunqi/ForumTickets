const CURRENCY_SYMBOLS: Record<string, string> = {
  CNY: '¥',
  NZD: 'NZ$',
  AUD: 'A$',
  USD: '$',
};

export function getCurrencySymbol(currency?: string): string {
  return CURRENCY_SYMBOLS[currency || 'CNY'] || '¥';
}

export const SUPPORTED_CURRENCIES = ['CNY', 'NZD', 'AUD', 'USD'];
