/**
 * @fileoverview Global Settings Page
 * @description Reusable settings page with sidebar navigation.
 *
 * This component uses Section internally for proper page layout.
 * Do NOT wrap this component in a Section when consuming it.
 */

import React, {
  useState,
  useMemo,
  useCallback,
  type ReactNode,
  type ComponentType,
} from 'react';
import { PaintBrushIcon, ChevronLeftIcon } from '@heroicons/react/24/outline';
import { Section } from '@sudobility/components';
import { cn } from '../../utils';
import { AppearanceSettings } from './appearance-settings';
import { Theme, FontSize } from './appearance-settings';
import type { AnalyticsTrackingParams } from '../../types';

/**
 * Configuration for a settings section in the navigation.
 */
export interface SettingsSectionConfig {
  /** Unique identifier for the section */
  id: string;
  /** Icon component to display */
  icon: ComponentType<{ className?: string }>;
  /** Display label */
  label: string;
  /** Short description shown below label */
  description: string;
  /** The content to render when this section is selected */
  content: ReactNode;
}

/**
 * Translation keys used by GlobalSettingsPage.
 */
export interface GlobalSettingsPageTranslations {
  title: string;
  backButton: string;
  appearanceLabel: string;
  appearanceDescription: string;
}

const defaultTranslations: GlobalSettingsPageTranslations = {
  title: 'Settings',
  backButton: 'Back',
  appearanceLabel: 'Appearance',
  appearanceDescription: 'Theme and font size settings',
};

export interface GlobalSettingsPageProps {
  /** Current theme value */
  theme: Theme | string;

  /** Current font size value */
  fontSize: FontSize | string;

  /** Callback when theme changes */
  onThemeChange: (theme: Theme) => void;

  /** Callback when font size changes */
  onFontSizeChange: (fontSize: FontSize) => void;

  /**
   * Additional settings sections to display after Appearance.
   * Each section needs an id, icon, label, description, and content.
   */
  additionalSections?: SettingsSectionConfig[];

  /**
   * Optional translation function.
   * Falls back to default English strings if not provided.
   */
  t?: (key: string, fallback?: string) => string;

  /**
   * Translation function for AppearanceSettings.
   * If provided, will be passed to AppearanceSettings component.
   */
  appearanceT?: (key: string, fallback?: string) => string;

  /** Optional className for the container */
  className?: string;

  /** Whether to show the info box in appearance settings */
  showAppearanceInfoBox?: boolean;

  /** Optional analytics tracking callback */
  onTrack?: (params: AnalyticsTrackingParams) => void;
}

/**
 * GlobalSettingsPage - A reusable settings page with master-detail layout.
 *
 * Features:
 * - Appearance settings built-in as the first section
 * - Extensible via additionalSections prop
 * - Responsive master-detail layout
 * - Mobile-friendly with back navigation
 *
 * @example
 * ```tsx
 * // Basic usage
 * <GlobalSettingsPage
 *   theme={theme}
 *   fontSize={fontSize}
 *   onThemeChange={setTheme}
 *   onFontSizeChange={setFontSize}
 * />
 *
 * // With additional sections
 * <GlobalSettingsPage
 *   theme={theme}
 *   fontSize={fontSize}
 *   onThemeChange={setTheme}
 *   onFontSizeChange={setFontSize}
 *   additionalSections={[
 *     {
 *       id: 'notifications',
 *       icon: BellIcon,
 *       label: 'Notifications',
 *       description: 'Manage notification preferences',
 *       content: <NotificationSettings />,
 *     },
 *   ]}
 * />
 * ```
 */
export const GlobalSettingsPage: React.FC<GlobalSettingsPageProps> = ({
  theme,
  fontSize,
  onThemeChange,
  onFontSizeChange,
  additionalSections = [],
  t,
  appearanceT,
  className,
  showAppearanceInfoBox = true,
  onTrack,
}) => {
  const [selectedSection, setSelectedSection] = useState('appearance');
  const [mobileView, setMobileView] = useState<'navigation' | 'content'>(
    'navigation'
  );

  // Helper to track analytics events
  const track = useCallback(
    (label: string, params?: Record<string, unknown>) => {
      onTrack?.({
        eventType: 'settings_change',
        componentName: 'GlobalSettingsPage',
        label,
        params,
      });
    },
    [onTrack]
  );

  // Wrapped handlers with tracking
  const handleThemeChange = useCallback(
    (newTheme: Theme) => {
      track('theme_changed', { theme: newTheme });
      onThemeChange(newTheme);
    },
    [track, onThemeChange]
  );

  const handleFontSizeChange = useCallback(
    (newFontSize: FontSize) => {
      track('font_size_changed', { font_size: newFontSize });
      onFontSizeChange(newFontSize);
    },
    [track, onFontSizeChange]
  );

  // Helper to get translated string with fallback
  const getText = useCallback(
    (key: keyof GlobalSettingsPageTranslations): string => {
      const fallback = defaultTranslations[key];
      return t ? t(key, fallback) : fallback;
    },
    [t]
  );

  // Build all sections with appearance first
  const allSections: SettingsSectionConfig[] = useMemo(
    () => [
      {
        id: 'appearance',
        icon: PaintBrushIcon,
        label: getText('appearanceLabel'),
        description: getText('appearanceDescription'),
        content: (
          <AppearanceSettings
            theme={theme}
            fontSize={fontSize}
            onThemeChange={handleThemeChange}
            onFontSizeChange={handleFontSizeChange}
            t={appearanceT}
            showInfoBox={showAppearanceInfoBox}
          />
        ),
      },
      ...additionalSections,
    ],
    [
      additionalSections,
      getText,
      theme,
      fontSize,
      handleThemeChange,
      handleFontSizeChange,
      appearanceT,
      showAppearanceInfoBox,
    ]
  );

  const currentSection =
    allSections.find(s => s.id === selectedSection) || allSections[0];

  const handleSectionSelect = (sectionId: string) => {
    track('section_selected', { section_id: sectionId });
    setSelectedSection(sectionId);
    setMobileView('content');
  };

  const handleBackToNavigation = () => {
    track('back_to_navigation');
    setMobileView('navigation');
  };

  // Navigation list
  const navigationList = (
    <div className='space-y-0'>
      {allSections.map(section => {
        const Icon = section.icon;
        const isSelected = selectedSection === section.id;
        return (
          <div
            key={section.id}
            onClick={() => handleSectionSelect(section.id)}
            className={cn(
              'flex items-start p-4 cursor-pointer transition-colors',
              'border-b border-gray-200 dark:border-gray-700 last:border-b-0',
              isSelected
                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
            )}
          >
            <Icon className='h-5 w-5 mt-0.5 mr-3 flex-shrink-0' />
            <div>
              <div className='font-medium'>{section.label}</div>
              <div className='text-xs text-gray-500 dark:text-gray-400 mt-0.5'>
                {section.description}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <Section spacing='lg' fullWidth className={cn(className)}>
      {/* Desktop Layout */}
      <div className='hidden md:flex h-full'>
        {/* Master (Navigation) */}
        <div className='w-80 flex-shrink-0 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900'>
          <div className='p-4 border-b border-gray-200 dark:border-gray-700'>
            <h1 className='text-xl font-semibold text-gray-900 dark:text-white'>
              {getText('title')}
            </h1>
          </div>
          <div className='overflow-y-auto'>{navigationList}</div>
        </div>

        {/* Detail (Content) */}
        <div className='flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-800'>
          <div className='p-6'>
            <h2 className='text-lg font-semibold text-gray-900 dark:text-white mb-6'>
              {currentSection.label}
            </h2>
            {currentSection.content}
          </div>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className='md:hidden'>
        {mobileView === 'navigation' ? (
          <div className='bg-white dark:bg-gray-900 min-h-full'>
            <div className='p-4 border-b border-gray-200 dark:border-gray-700'>
              <h1 className='text-xl font-semibold text-gray-900 dark:text-white'>
                {getText('title')}
              </h1>
            </div>
            {navigationList}
          </div>
        ) : (
          <div className='bg-white dark:bg-gray-900 min-h-full'>
            <div className='p-4 border-b border-gray-200 dark:border-gray-700 flex items-center'>
              <button
                onClick={handleBackToNavigation}
                className='flex items-center text-blue-600 dark:text-blue-400 mr-4'
              >
                <ChevronLeftIcon className='h-5 w-5 mr-1' />
                <span>{getText('backButton')}</span>
              </button>
              <h2 className='text-lg font-semibold text-gray-900 dark:text-white'>
                {currentSection.label}
              </h2>
            </div>
            <div className='p-4'>{currentSection.content}</div>
          </div>
        )}
      </div>
    </Section>
  );
};

export default GlobalSettingsPage;
