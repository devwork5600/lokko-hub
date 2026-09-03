import { describe, expect, it } from 'vitest';

import { haversineDistanceKm } from './geo';

describe('haversineDistanceKm', () => {
  it('returns 0 for the same point', () => {
    expect(haversineDistanceKm(47.2184, -1.5536, 47.2184, -1.5536)).toBe(0);
  });

  it('returns roughly the real distance between Nantes and Paris (~340km)', () => {
    const distance = haversineDistanceKm(47.2184, -1.5536, 48.8566, 2.3522);
    expect(distance).toBeGreaterThan(330);
    expect(distance).toBeLessThan(350);
  });
});
