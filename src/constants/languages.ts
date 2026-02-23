/**
 * @fileoverview Language configuration constants for i18n support.
 *
 * Provides a default set of 16 supported languages, RTL language detection,
 * and the LanguageConfig interface used throughout the building_blocks package.
 */

/**
 * Configuration for a supported language.
 *
 * Used by LanguageSelector, initializeI18n, and consuming apps
 * to display available languages with their native names and emoji flags.
 */
export interface LanguageConfig {
  /** ISO 639-1 language code (e.g., 'en', 'zh-hant') */
  code: string;
  /** Native name of the language (e.g., 'English', '日本語') */
  name: string;
  /** Emoji flag representing the language's primary region (e.g., '🇺🇸') */
  flag: string;
}

/**
 * Default set of 16 supported languages with their flags.
 * Apps can override this list by passing their own languages prop.
 */
export const DEFAULT_LANGUAGES: LanguageConfig[] = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'sv', name: 'Svenska', flag: '🇸🇪' },
  { code: 'th', name: 'ไทย', flag: '🇹🇭' },
  { code: 'uk', name: 'Українська', flag: '🇺🇦' },
  { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'zh', name: '简体中文', flag: '🇨🇳' },
  { code: 'zh-hant', name: '繁體中文', flag: '🇹🇼' },
];

/**
 * Languages that use right-to-left text direction.
 */
export const RTL_LANGUAGES = ['ar'];

/**
 * Check if a language code is RTL.
 *
 * @param languageCode - ISO 639-1 language code to check
 * @returns true if the language uses right-to-left text direction
 */
export function isRTL(languageCode: string): boolean {
  return RTL_LANGUAGES.includes(languageCode);
}
