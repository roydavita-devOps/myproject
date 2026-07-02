import { describe, expect, it } from 'vitest';
import { formatMenuPrice } from '../../priceFormat';

describe('formatMenuPrice', () => {
  it('keeps IDR menu currency display working', () => {
    expect(formatMenuPrice({ price: '68000', priceCurrency: 'IDR' })).toBe('Rp 68.000');
  });

  it('keeps USD menu currency display working', () => {
    expect(formatMenuPrice({ price: '12.5', priceCurrency: 'USD' })).toBe('$12.50');
  });
});
