import { formatCountdown, getCurrentDateString, getYesterdayDateString } from '../utils';

describe('Utility functions', () => {
  test('formatCountdown should format seconds correctly', () => {
    expect(formatCountdown(0)).toBe('0:00');
    expect(formatCountdown(59)).toBe('0:59');
    expect(formatCountdown(60)).toBe('1:00');
    expect(formatCountdown(180)).toBe('3:00');
    expect(formatCountdown(3661)).toBe('1:01:01');
  });

  test('getCurrentDateString should return current date in YYYY-MM-DD format', () => {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    expect(getCurrentDateString()).toMatch(dateRegex);
  });

  test('getYesterdayDateString should return yesterday date in YYYY-MM-DD format', () => {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    expect(getYesterdayDateString()).toMatch(dateRegex);
  });
});
