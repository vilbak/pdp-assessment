import { describe, expect, it } from 'vitest';
import { clampRating } from '../rating';

describe('clampRating', () => {
  it('rounds to the nearest integer', () => {
    expect(clampRating(4.3)).toBe(4);
    expect(clampRating(4.6)).toBe(5);
  });

  it('clamps above 5', () => {
    expect(clampRating(6)).toBe(5);
  });

  it('clamps below 0', () => {
    expect(clampRating(-1)).toBe(0);
  });
});
