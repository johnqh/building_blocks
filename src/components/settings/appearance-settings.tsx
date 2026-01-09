import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Label,
} from '@sudobility/components';
import { textVariants } from '@sudobility/design';

/**
 * Theme options for appearance settings.
 */
export enum Theme {
  LIGHT = 'light',
  DARK = 'dark',
  SYSTEM = 'system',
}

/**
 * Font size options for appearance settings.
 */
export enum FontSize {
  SMALL = 'small',
  MEDIUM = 'medium',
  LARGE = 'large',
}

/**
 * Translation keys used by AppearanceSettings.
 * Provide a translation function to customize labels.
 */
export interface AppearanceSettingsTranslations {
  heading: string;
  description: string;
  themeLabel: string;
  themeSelectPlaceholder: string;
  themeLight: string;
  themeDark: string;
  themeSystem: string;
  themeDescription: string;
  fontSizeLabel: string;
  fontSizeSelectPlaceholder: string;
  fontSizeSmall: string;
  fontSizeMedium: string;
  fontSizeLarge: string;
  fontSizeDescription: string;
  infoHeading: string;
  infoDescription: string;
}

const defaultTranslations: AppearanceSettingsTranslations = {
  heading: 'Appearance',
  description: 'Customize the look and feel of the application.',
  themeLabel: 'Theme',
  themeSelectPlaceholder: 'Select theme',
  themeLight: 'Light',
  themeDark: 'Dark',
  themeSystem: 'System',
  themeDescription: 'Choose your preferred color theme.',
  fontSizeLabel: 'Font Size',
  fontSizeSelectPlaceholder: 'Select font size',
  fontSizeSmall: 'Small',
  fontSizeMedium: 'Medium',
  fontSizeLarge: 'Large',
  fontSizeDescription: 'Adjust the text size for better readability.',
  infoHeading: 'About Settings',
  infoDescription:
    'Your appearance preferences are saved locally and will be applied automatically on your next visit.',
};

export interface AppearanceSettingsProps {
  /** Current theme value */
  theme: Theme | string;

  /** Current font size value */
  fontSize: FontSize | string;

  /** Callback when theme changes */
  onThemeChange: (theme: Theme) => void;

  /** Callback when font size changes */
  onFontSizeChange: (fontSize: FontSize) => void;

  /**
   * Optional translation function.
   * If provided, will be called with a key from AppearanceSettingsTranslations.
   * Falls back to default English strings if not provided.
   */
  t?: (key: string, fallback?: string) => string;

  /** Optional className for the container */
  className?: string;

  /** Whether to show the information box at the bottom */
  showInfoBox?: boolean;
}

/**
 * AppearanceSettings - A reusable component for theme and font size settings.
 *
 * This component can be used across different apps to provide consistent
 * appearance customization options.
 *
 * @example
 * ```tsx
 * // Basic usage with useTheme hook
 * const { theme, fontSize, setTheme, setFontSize } = useTheme();
 *
 * <AppearanceSettings
 *   theme={theme}
 *   fontSize={fontSize}
 *   onThemeChange={setTheme}
 *   onFontSizeChange={setFontSize}
 * />
 *
 * // With i18n translation
 * const { t } = useTranslation('settings');
 *
 * <AppearanceSettings
 *   theme={theme}
 *   fontSize={fontSize}
 *   onThemeChange={setTheme}
 *   onFontSizeChange={setFontSize}
 *   t={(key, fallback) => t(`appearance.${key}`, fallback)}
 * />
 * ```
 */
export const AppearanceSettings: React.FC<AppearanceSettingsProps> = ({
  theme,
  fontSize,
  onThemeChange,
  onFontSizeChange,
  t,
  className,
  showInfoBox = true,
}) => {
  // Helper to get translated string with fallback
  const getText = (key: keyof AppearanceSettingsTranslations): string => {
    const fallback = defaultTranslations[key];
    return t ? t(key, fallback) : fallback;
  };

  return (
    <div className={className}>
      <div className='space-y-6'>
        <div>
          <h2 className={`${textVariants.heading.h4()} mb-2`}>
            {getText('heading')}
          </h2>
          <p
            className={`${textVariants.body.sm()} text-gray-600 dark:text-gray-400`}
          >
            {getText('description')}
          </p>
        </div>

        <div className='space-y-6'>
          {/* Theme Setting */}
          <div className='space-y-2'>
            <Label
              htmlFor='theme-select'
              className={textVariants.label.default()}
            >
              {getText('themeLabel')}
            </Label>
            <Select
              value={theme}
              onValueChange={(value: string) => onThemeChange(value as Theme)}
            >
              <SelectTrigger id='theme-select'>
                <SelectValue placeholder={getText('themeSelectPlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={Theme.LIGHT}>
                  {getText('themeLight')}
                </SelectItem>
                <SelectItem value={Theme.DARK}>
                  {getText('themeDark')}
                </SelectItem>
                <SelectItem value={Theme.SYSTEM}>
                  {getText('themeSystem')}
                </SelectItem>
              </SelectContent>
            </Select>
            <p
              className={`${textVariants.body.xs()} text-gray-500 dark:text-gray-400`}
            >
              {getText('themeDescription')}
            </p>
          </div>

          {/* Font Size Setting */}
          <div className='space-y-2'>
            <Label
              htmlFor='font-size-select'
              className={textVariants.label.default()}
            >
              {getText('fontSizeLabel')}
            </Label>
            <Select
              value={fontSize}
              onValueChange={(value: string) =>
                onFontSizeChange(value as FontSize)
              }
            >
              <SelectTrigger id='font-size-select'>
                <SelectValue
                  placeholder={getText('fontSizeSelectPlaceholder')}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={FontSize.SMALL}>
                  {getText('fontSizeSmall')}
                </SelectItem>
                <SelectItem value={FontSize.MEDIUM}>
                  {getText('fontSizeMedium')}
                </SelectItem>
                <SelectItem value={FontSize.LARGE}>
                  {getText('fontSizeLarge')}
                </SelectItem>
              </SelectContent>
            </Select>
            <p
              className={`${textVariants.body.xs()} text-gray-500 dark:text-gray-400`}
            >
              {getText('fontSizeDescription')}
            </p>
          </div>
        </div>

        {/* Information Box */}
        {showInfoBox && (
          <div className='bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800'>
            <h4 className='text-sm font-medium text-blue-900 dark:text-blue-100 mb-2'>
              {getText('infoHeading')}
            </h4>
            <p className='text-sm text-blue-700 dark:text-blue-300'>
              {getText('infoDescription')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AppearanceSettings;
