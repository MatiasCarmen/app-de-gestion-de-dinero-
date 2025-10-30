import {formatCurrency} from './formatters';

describe('formatCurrency', () => {
  it('should format a positive number correctly as USD by default', () => {
    expect(formatCurrency(1234.56)).toBe('$1,234.56');
  });

  it('should format zero correctly', () => {
    expect(formatCurrency(0)).toBe('$0.00');
  });

  it('should format a negative number correctly', () => {
    expect(formatCurrency(-500)).toBe('-$500.00');
  });

  it('should handle large numbers with commas', () => {
    expect(formatCurrency(1000000)).toBe('$1,000,000.00');
  });

  it('should format a number with a different currency (EUR)', () => {
    // The '€' symbol might be at the end depending on the locale.
    // Using a regex to make the test more robust against locale variations.
    const result = formatCurrency(500, 'EUR', 'de-DE');
    expect(result).toMatch(/500,00\s€/); // e.g., "500,00 €"
  });

  it('should format a number with a different currency (JPY)', () => {
    // JPY does not use minor units (cents).
    const result = formatCurrency(1500, 'JPY', 'ja-JP');
    expect(result).toBe('￥1,500');
  });
});
