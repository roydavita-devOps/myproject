import { describe, expect, it } from 'vitest';
import { formatOpeningHours } from '../../openingHours';

describe('formatOpeningHours', () => {
  it('returns a clean legacy string unchanged', () => {
    expect(formatOpeningHours('Daily, 11.00 - 22.00')).toBe('Daily, 11.00 - 22.00');
  });

  it('formats daily structured opening hours', () => {
    expect(formatOpeningHours({ mode: 'daily', openTime: '11:00', closeTime: '22:00' })).toBe('Daily, 11.00 - 22.00');
  });

  it('formats specific consecutive days as a compact range', () => {
    expect(formatOpeningHours({
      mode: 'specific',
      days: ['tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
      openTime: '11:00',
      closeTime: '22:00',
    })).toBe('Tue - Sat, 11.00 - 22.00');
  });

  it('formats non-consecutive custom days as a readable list', () => {
    expect(formatOpeningHours({
      mode: 'custom',
      days: ['monday', 'wednesday', 'friday'],
      openTime: '09:00',
      closeTime: '18:00',
    })).toBe('Mon, Wed, Fri, 09.00 - 18.00');
  });

  it('formats closed opening hours', () => {
    expect(formatOpeningHours({ mode: 'closed' })).toBe('Closed');
  });

  it('never exposes raw internal opening-hours keys', () => {
    const value = formatOpeningHours({ mode: 'unknown', openTime: '11:00', closeTime: '22:00' }, 'Opening hours not set');

    expect(value).toBe('Opening hours not set');
    expect(value).not.toContain('mode');
    expect(value).not.toContain('openTime');
    expect(value).not.toContain('closeTime');
  });
});
