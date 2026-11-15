import { shuffleInPlace } from '../random';

describe('shuffleInPlace', () => {
  it('returns the same array reference', () => {
    const items = [1, 2, 3];
    expect(shuffleInPlace(items)).toBe(items);
  });

  it('preserves membership for a small array', () => {
    const items = ['a', 'b', 'c', 'd'];
    const before = [...items].sort();
    shuffleInPlace(items);
    expect([...items].sort()).toEqual(before);
  });

  it('is a no-op for empty and single-element arrays', () => {
    expect(shuffleInPlace([])).toEqual([]);
    expect(shuffleInPlace([42])).toEqual([42]);
  });
});
