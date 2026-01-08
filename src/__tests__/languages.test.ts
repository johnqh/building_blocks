import { describe, it, expect } from 'vitest';
import {
  DEFAULT_LANGUAGES,
  RTL_LANGUAGES,
  isRTL,
} from '../constants/languages';

describe('Language Constants', () => {
  describe('DEFAULT_LANGUAGES', () => {
    it('contains 16 languages', () => {
      expect(DEFAULT_LANGUAGES).toHaveLength(16);
    });

    it('includes English as the first language', () => {
      expect(DEFAULT_LANGUAGES[0]).toEqual({
        code: 'en',
        name: 'English',
        flag: '🇺🇸',
      });
    });

    it('all languages have code, name, and flag properties', () => {
      DEFAULT_LANGUAGES.forEach(lang => {
        expect(lang).toHaveProperty('code');
        expect(lang).toHaveProperty('name');
        expect(lang).toHaveProperty('flag');
        expect(typeof lang.code).toBe('string');
        expect(typeof lang.name).toBe('string');
        expect(typeof lang.flag).toBe('string');
      });
    });

    it('has unique language codes', () => {
      const codes = DEFAULT_LANGUAGES.map(lang => lang.code);
      const uniqueCodes = new Set(codes);
      expect(uniqueCodes.size).toBe(codes.length);
    });

    it('includes common languages', () => {
      const codes = DEFAULT_LANGUAGES.map(lang => lang.code);
      expect(codes).toContain('en');
      expect(codes).toContain('es');
      expect(codes).toContain('fr');
      expect(codes).toContain('de');
      expect(codes).toContain('zh');
      expect(codes).toContain('ja');
      expect(codes).toContain('ko');
      expect(codes).toContain('ar');
    });
  });

  describe('RTL_LANGUAGES', () => {
    it('includes Arabic', () => {
      expect(RTL_LANGUAGES).toContain('ar');
    });

    it('is an array of strings', () => {
      expect(Array.isArray(RTL_LANGUAGES)).toBe(true);
      RTL_LANGUAGES.forEach(lang => {
        expect(typeof lang).toBe('string');
      });
    });
  });

  describe('isRTL', () => {
    it('returns true for Arabic', () => {
      expect(isRTL('ar')).toBe(true);
    });

    it('returns false for English', () => {
      expect(isRTL('en')).toBe(false);
    });

    it('returns false for other LTR languages', () => {
      expect(isRTL('es')).toBe(false);
      expect(isRTL('fr')).toBe(false);
      expect(isRTL('de')).toBe(false);
      expect(isRTL('ja')).toBe(false);
      expect(isRTL('zh')).toBe(false);
    });

    it('returns false for unknown language codes', () => {
      expect(isRTL('unknown')).toBe(false);
      expect(isRTL('')).toBe(false);
    });
  });
});
