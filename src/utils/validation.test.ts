
import { describe, it, expect } from 'vitest';
import { generateShortCode } from './validation';

describe('Validation Utilities', () => {
  describe('generateShortCode', () => {
    it('should generate a string of the correct length', () => {
      const code = generateShortCode();
      expect(typeof code).toBe('string');
      expect(code.length).toBe(6); // Assuming the default length is 6
    });

    it('should generate unique codes', () => {
      const codes = new Set();
      for (let i = 0; i < 100; i++) {
        codes.add(generateShortCode());
      }
      // If all codes are unique, the set size should be 100
      expect(codes.size).toBe(100);
    });
  });
});
