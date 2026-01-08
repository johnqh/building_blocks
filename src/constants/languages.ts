export interface LanguageConfig {
  code: string;
  name: string;
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
 */
export function isRTL(languageCode: string): boolean {
  return RTL_LANGUAGES.includes(languageCode);
}
