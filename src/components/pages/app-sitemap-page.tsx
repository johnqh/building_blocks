/**
 * @fileoverview App Sitemap Page
 * @description Reusable sitemap page component with categorized links.
 *
 * This component uses Section internally for proper page layout.
 * Do NOT wrap this component in a Section when consuming it.
 */

import React, { type ComponentType, type ReactNode } from 'react';
import {
  ChevronRightIcon,
  HomeIcon,
  DocumentTextIcon,
  EnvelopeIcon,
  CogIcon,
  LanguageIcon,
} from '@heroicons/react/24/outline';
import { Section } from '@sudobility/components';
import { cn } from '../../utils';
import type { LinkComponentProps } from '../../types';

/**
 * Configuration for a single sitemap link
 */
export interface SitemapLink {
  /** URL path */
  path: string;
  /** Display label */
  label: string;
  /** Optional description */
  description?: string;
}

/**
 * Configuration for a sitemap section
 */
export interface SitemapSection {
  /** Section title */
  title: string;
  /** Section icon type (optional) */
  icon?: 'home' | 'document' | 'envelope' | 'cog' | 'language';
  /** Links in this section */
  links: SitemapLink[];
}

/**
 * Configuration for a language option
 */
export interface LanguageOption {
  /** Language code (e.g., 'en', 'es') */
  code: string;
  /** Display name */
  name: string;
  /** Flag emoji */
  flag: string;
}

/**
 * Configuration for quick action buttons
 */
export interface QuickLink {
  /** URL path */
  path: string;
  /** Display label */
  label: string;
  /** Button variant */
  variant: 'primary' | 'secondary' | 'outline';
  /** Optional icon */
  icon?: 'envelope' | 'document';
}

/**
 * Text content for the sitemap page
 */
export interface SitemapPageText {
  /** Page title */
  title: string;
  /** Page subtitle */
  subtitle: string;
  /** Languages section title */
  languagesSectionTitle: string;
  /** Languages section description */
  languagesDescription: string;
  /** Quick links section title */
  quickLinksTitle: string;
}

/**
 * Props for AppSitemapPage component
 */
export interface AppSitemapPageProps {
  /** All text content (must be provided by consumer) */
  text: SitemapPageText;
  /** Sitemap sections */
  sections: SitemapSection[];
  /** Available languages */
  languages: LanguageOption[];
  /** Quick action links */
  quickLinks?: QuickLink[];
  /** Custom Link component for navigation */
  LinkComponent: ComponentType<LinkComponentProps & { language?: string }>;
  /** Optional wrapper component for the page layout */
  PageWrapper?: ComponentType<{ children: ReactNode }>;
  /** Optional className for the container */
  className?: string;
}

/**
 * Get icon component based on icon type
 */
const getIcon = (icon?: string) => {
  switch (icon) {
    case 'home':
      return <HomeIcon className='w-5 h-5 mr-2' />;
    case 'document':
      return <DocumentTextIcon className='w-5 h-5 mr-2' />;
    case 'envelope':
      return <EnvelopeIcon className='w-5 h-5 mr-2' />;
    case 'cog':
      return <CogIcon className='w-5 h-5 mr-2' />;
    case 'language':
      return <LanguageIcon className='w-5 h-5 mr-2' />;
    default:
      return null;
  }
};

/**
 * AppSitemapPage - A reusable sitemap page component
 *
 * Displays a comprehensive sitemap with:
 * - Language selector
 * - Organized sections with links
 * - Quick action buttons
 *
 * All text content must be provided by the consumer app.
 *
 * @example
 * ```tsx
 * <AppSitemapPage
 *   text={{
 *     title: "Sitemap",
 *     subtitle: "Explore all pages",
 *     languagesSectionTitle: "Languages",
 *     languagesDescription: "Available in multiple languages",
 *     quickLinksTitle: "Quick Links"
 *   }}
 *   sections={[
 *     { title: "Main", icon: "home", links: [{ path: "/", label: "Home" }] }
 *   ]}
 *   languages={[{ code: "en", name: "English", flag: "🇺🇸" }]}
 *   LinkComponent={LocalizedLink}
 * />
 * ```
 */
export const AppSitemapPage: React.FC<AppSitemapPageProps> = ({
  text,
  sections,
  languages,
  quickLinks = [],
  LinkComponent,
  PageWrapper,
  className,
}) => {
  const content = (
    <Section spacing='3xl' maxWidth='6xl' className={cn(className)}>
      {/* Header */}
      <div className='text-center mb-12'>
        <h1 className='text-4xl font-bold text-gray-900 dark:text-white mb-4'>
          {text.title}
        </h1>
        <p className='text-xl text-gray-600 dark:text-gray-300'>
          {text.subtitle}
        </p>
      </div>

      {/* Language Section */}
      {languages.length > 0 && (
        <div className='mb-12 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg'>
          <h2 className='text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center'>
            <LanguageIcon className='w-6 h-6 mr-2' />
            {text.languagesSectionTitle}
          </h2>
          <p className='text-gray-600 dark:text-gray-300 mb-6'>
            {text.languagesDescription}
          </p>
          <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4'>
            {languages.map(lang => (
              <LinkComponent
                key={lang.code}
                href='/'
                language={lang.code}
                className='flex items-center space-x-2 p-3 bg-white dark:bg-gray-800 rounded-lg hover:shadow-md transition-shadow'
              >
                <span className='text-2xl'>{lang.flag}</span>
                <div className='font-medium text-gray-900 dark:text-white'>
                  {lang.name}
                </div>
              </LinkComponent>
            ))}
          </div>
        </div>
      )}

      {/* Sitemap Grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
        {sections.map((section, index) => (
          <div
            key={index}
            className='bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6'
          >
            <h2 className='text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center'>
              {getIcon(section.icon)}
              {section.title}
            </h2>
            <ul className='space-y-2'>
              {section.links.map((link, linkIndex) => (
                <li key={linkIndex}>
                  <LinkComponent
                    href={link.path}
                    className='group flex items-start text-sm hover:text-blue-600 dark:hover:text-blue-400 transition-colors'
                  >
                    <ChevronRightIcon className='w-4 h-4 mt-0.5 mr-2 flex-shrink-0 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400' />
                    <div>
                      <span className='font-medium text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400'>
                        {link.label}
                      </span>
                      {link.description && (
                        <span className='block text-xs text-gray-500 dark:text-gray-400 mt-0.5'>
                          {link.description}
                        </span>
                      )}
                    </div>
                  </LinkComponent>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Quick Links Section */}
      {quickLinks.length > 0 && (
        <div className='mt-12 p-6 bg-gray-50 dark:bg-gray-900 rounded-lg'>
          <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-4'>
            {text.quickLinksTitle}
          </h3>
          <div className='flex flex-wrap gap-3'>
            {quickLinks.map((link, index) => {
              const baseClasses =
                'inline-flex items-center px-4 py-2 rounded-lg transition-colors';
              const variantClasses =
                link.variant === 'primary'
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : link.variant === 'secondary'
                    ? 'bg-gray-600 text-white hover:bg-gray-700'
                    : 'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800';

              return (
                <LinkComponent
                  key={index}
                  href={link.path}
                  className={`${baseClasses} ${variantClasses}`}
                >
                  {link.icon === 'envelope' && (
                    <EnvelopeIcon className='w-5 h-5 mr-2' />
                  )}
                  {link.icon === 'document' && (
                    <DocumentTextIcon className='w-5 h-5 mr-2' />
                  )}
                  {link.label}
                </LinkComponent>
              );
            })}
          </div>
        </div>
      )}
    </Section>
  );

  if (PageWrapper) {
    return <PageWrapper>{content}</PageWrapper>;
  }

  return content;
};

export default AppSitemapPage;
