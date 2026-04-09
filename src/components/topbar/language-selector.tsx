import React, {
  useState,
  useCallback,
  useMemo,
  useRef,
  useEffect,
} from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { cn } from '../../utils';
import { ui } from '@sudobility/design';
import {
  DEFAULT_LANGUAGES,
  type LanguageConfig,
} from '../../constants/languages';

export interface LanguageSelectorProps {
  /** Available languages (defaults to 16 built-in languages) */
  languages?: LanguageConfig[];
  /** Current language code */
  currentLanguage?: string;
  /** Language change handler */
  onLanguageChange?: (languageCode: string) => void;
  /** Variant: 'compact' for topbar, 'full' for settings */
  variant?: 'compact' | 'full';
  /** Custom className */
  className?: string;
  /** Label text for full variant */
  label?: string;
  /** Helper text for full variant */
  helperText?: string;
}

/**
 * LanguageSelector component with dropdown for switching languages.
 * Uses default 16 languages if none provided.
 *
 * @example
 * ```tsx
 * // Compact variant for topbar
 * <LanguageSelector
 *   currentLanguage="en"
 *   onLanguageChange={(code) => i18n.changeLanguage(code)}
 *   variant="compact"
 * />
 *
 * // Full variant for settings pages
 * <LanguageSelector
 *   currentLanguage="en"
 *   onLanguageChange={(code) => i18n.changeLanguage(code)}
 *   variant="full"
 *   label="Language"
 *   helperText="Select your preferred language"
 * />
 * ```
 */
export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  languages = DEFAULT_LANGUAGES,
  currentLanguage = 'en',
  onLanguageChange,
  variant = 'compact',
  className,
  label = 'Language',
  helperText = 'Select your preferred language',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Sort languages alphabetically by name
  const sortedLanguages = useMemo(
    () => [...languages].sort((a, b) => a.name.localeCompare(b.name)),
    [languages]
  );

  const currentLang = useMemo(
    () => languages.find(lang => lang.code === currentLanguage) || languages[0],
    [languages, currentLanguage]
  );

  const handleLanguageChange = useCallback(
    (langCode: string) => {
      if (langCode !== currentLanguage) {
        onLanguageChange?.(langCode);
      }
      setIsOpen(false);
    },
    [currentLanguage, onLanguageChange]
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () =>
        document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Close dropdown on escape
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen]);

  if (variant === 'compact') {
    return (
      <div ref={dropdownRef} className={cn('relative', className)}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            'flex items-center gap-2 px-3 py-2 h-10 rounded-lg',
            'hover:bg-gray-100 dark:hover:bg-gray-700',
            'transition-colors'
          )}
          aria-label='Select language'
          aria-expanded={isOpen}
          aria-haspopup='listbox'
        >
          <span className='text-lg leading-none'>{currentLang?.flag}</span>
          <span
            className={`hidden sm:block text-sm font-medium ${ui.text.label}`}
          >
            {currentLang?.name}
          </span>
          <ChevronDownIcon
            className={cn(
              `h-4 w-4 ${ui.text.muted} transition-transform`,
              isOpen && 'rotate-180'
            )}
          />
        </button>

        {isOpen && (
          <div
            className={cn(
              'absolute right-0 mt-2 w-48 py-1 z-50',
              ui.background.surface,
              `border ${ui.border.default}`,
              'rounded-lg shadow-lg'
            )}
            role='listbox'
            aria-label='Languages'
          >
            {sortedLanguages.map(lang => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2 text-left',
                  'hover:bg-gray-100 dark:hover:bg-gray-700',
                  'transition-colors',
                  lang.code === currentLanguage &&
                    'bg-gray-100 dark:bg-gray-700 font-medium'
                )}
                role='option'
                aria-selected={lang.code === currentLanguage}
              >
                <span className='text-lg leading-none'>{lang.flag}</span>
                <span className={`text-sm ${ui.text.label}`}>{lang.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Full variant for settings pages
  return (
    <div ref={dropdownRef} className={cn('space-y-2', className)}>
      <label className={`${ui.text.label} flex items-center gap-2`}>
        <span>{label}</span>
      </label>

      <div className='relative'>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            'flex items-center justify-between w-full px-3 py-2 text-left',
            ui.background.surface,
            `border ${ui.border.default}`,
            'rounded-md',
            'hover:bg-gray-50 dark:hover:bg-gray-700',
            'transition-colors'
          )}
          aria-expanded={isOpen}
          aria-haspopup='listbox'
        >
          <div className='flex items-center gap-2'>
            <span className='text-lg leading-none'>{currentLang?.flag}</span>
            <span className={`text-sm ${ui.text.label}`}>
              {currentLang?.name}
            </span>
          </div>
          <ChevronDownIcon
            className={cn(
              `h-4 w-4 ${ui.text.muted} transition-transform`,
              isOpen && 'rotate-180'
            )}
          />
        </button>

        {isOpen && (
          <div
            className={cn(
              'absolute left-0 right-0 mt-1 py-1 z-50',
              ui.background.surface,
              `border ${ui.border.default}`,
              'rounded-md shadow-lg'
            )}
            role='listbox'
            aria-label='Languages'
          >
            {sortedLanguages.map(lang => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2 text-left',
                  'hover:bg-gray-100 dark:hover:bg-gray-700',
                  'transition-colors',
                  lang.code === currentLanguage &&
                    'bg-gray-100 dark:bg-gray-700 font-medium'
                )}
                role='option'
                aria-selected={lang.code === currentLanguage}
              >
                <span className='text-lg leading-none'>{lang.flag}</span>
                <span className={`text-sm ${ui.text.label}`}>{lang.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {helperText && <p className={`text-xs ${ui.text.muted}`}>{helperText}</p>}
    </div>
  );
};

export default LanguageSelector;
