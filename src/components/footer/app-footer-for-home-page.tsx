import React, { type ComponentType } from 'react';
import {
  Logo,
  Footer as FooterContainer,
  FooterGrid,
  FooterBrand,
  FooterLinkSection,
  FooterLink,
  FooterBottom,
  FooterVersion,
  FooterCopyright,
  FooterSocialLinks,
} from '@sudobility/components';
import { cn } from '../../utils';
import type {
  StatusIndicatorConfig,
  LinkComponentProps,
  FooterLinkSection as FooterLinkSectionConfig,
  SocialLinksConfig,
} from '../../types';
import type { SystemStatusIndicatorProps } from './app-footer';

export interface AppFooterForHomePageProps {
  /** App logo configuration */
  logo: {
    /** Logo image src (optional - if not provided, uses Logo component) */
    src?: string;
    /** App name */
    appName: string;
  };

  /** Footer link sections (columns of links) */
  linkSections: FooterLinkSectionConfig[];

  /** Social media links */
  socialLinks?: SocialLinksConfig;

  /** System status indicator configuration */
  statusIndicator?: StatusIndicatorConfig;

  /**
   * SystemStatusIndicator component from @sudobility/devops-components.
   * Pass this to enable status indicator functionality.
   */
  StatusIndicatorComponent?: ComponentType<SystemStatusIndicatorProps>;

  /** App version string */
  version?: string;

  /** Copyright year or range */
  copyrightYear?: string;

  /** Company name for copyright */
  companyName: string;

  /** Company link URL (optional) */
  companyUrl?: string;

  /** Footer description text (below logo) */
  description?: string;

  /** Rights text (e.g., "All rights reserved") */
  rightsText?: string;

  /** Custom Link component */
  LinkComponent?: ComponentType<LinkComponentProps>;

  /** Network online status (for status indicator) */
  isNetworkOnline?: boolean;

  /** Custom className */
  className?: string;

  /** Number of columns for link grid (default: auto based on section count) */
  gridColumns?: 2 | 3 | 4 | 5;
}

/**
 * Default link component that renders a plain anchor.
 */
const DefaultLinkComponent: ComponentType<LinkComponentProps> = ({
  href,
  className,
  children,
  onClick,
}) => (
  <a href={href} className={className} onClick={onClick}>
    {children}
  </a>
);

/**
 * Helper to get copyright year or range.
 */
function getCopyrightYear(startYear = 2025): string {
  const currentYear = new Date().getFullYear();
  if (currentYear === startYear) {
    return String(startYear);
  } else if (currentYear > startYear) {
    return `${startYear}-${currentYear}`;
  }
  return String(startYear);
}

/**
 * Get grid columns class based on section count.
 */
function getGridColumnsClass(sectionCount: number, explicit?: number): string {
  const cols = explicit || Math.min(sectionCount, 4);
  switch (cols) {
    case 2:
      return 'md:grid-cols-2';
    case 3:
      return 'md:grid-cols-3';
    case 4:
      return 'md:grid-cols-4';
    case 5:
      return 'md:grid-cols-5';
    default:
      return 'md:grid-cols-4';
  }
}

/**
 * AppFooterForHomePage - Full footer for home/landing pages.
 *
 * Features:
 * - Multiple link sections in a grid
 * - Logo and brand description
 * - Social media links
 * - System status indicator (optional)
 * - Version and copyright
 * - Dark mode support
 *
 * @example
 * ```tsx
 * import { SystemStatusIndicator } from '@sudobility/devops-components';
 *
 * <AppFooterForHomePage
 *   logo={{ appName: 'My App' }}
 *   linkSections={[
 *     {
 *       title: 'Product',
 *       links: [
 *         { label: 'Features', href: '/features' },
 *         { label: 'Pricing', href: '/pricing' },
 *       ],
 *     },
 *     {
 *       title: 'Company',
 *       links: [
 *         { label: 'About', href: '/about' },
 *         { label: 'Contact', href: '/contact' },
 *       ],
 *     },
 *   ]}
 *   socialLinks={{
 *     twitterUrl: 'https://twitter.com/myapp',
 *     discordUrl: 'https://discord.gg/myapp',
 *   }}
 *   statusIndicator={{
 *     statusPageUrl: 'https://status.example.com',
 *   }}
 *   StatusIndicatorComponent={SystemStatusIndicator}
 *   version="1.0.0"
 *   companyName="Sudobility Inc."
 *   description="Building the future of web3 communication"
 * />
 * ```
 */
export const AppFooterForHomePage: React.FC<AppFooterForHomePageProps> = ({
  logo,
  linkSections,
  socialLinks,
  statusIndicator,
  StatusIndicatorComponent,
  version,
  copyrightYear,
  companyName,
  companyUrl,
  description,
  rightsText = 'All rights reserved',
  LinkComponent = DefaultLinkComponent,
  isNetworkOnline = true,
  className,
  gridColumns,
}) => {
  const year = copyrightYear || getCopyrightYear();
  const gridClass = getGridColumnsClass(linkSections.length, gridColumns);

  const companyLink = companyUrl ? (
    <LinkComponent
      href={companyUrl}
      className='text-blue-400 hover:text-blue-300 transition-colors'
    >
      {companyName}
    </LinkComponent>
  ) : undefined;

  return (
    <FooterContainer variant='full' className={cn(className)}>
      <FooterGrid className={gridClass}>
        {linkSections.map((section, sectionIndex) => (
          <FooterLinkSection
            key={section.title || sectionIndex}
            title={section.title}
          >
            {section.links.map((link, linkIndex) => (
              <FooterLink key={link.href || linkIndex}>
                {link.onClick ? (
                  <button onClick={link.onClick} className='text-left'>
                    {link.label}
                  </button>
                ) : (
                  <LinkComponent href={link.href}>{link.label}</LinkComponent>
                )}
              </FooterLink>
            ))}
          </FooterLinkSection>
        ))}
      </FooterGrid>

      <FooterBottom>
        <FooterBrand
          description={description}
          className='flex flex-col items-center'
        >
          <LinkComponent
            href='/'
            className='text-white hover:opacity-80 transition-opacity'
          >
            {logo.src ? (
              <img
                src={logo.src}
                alt={logo.appName}
                className='h-8 object-contain'
              />
            ) : (
              <Logo size='md' showText={true} logoText={logo.appName} />
            )}
          </LinkComponent>
        </FooterBrand>
        {version && <FooterVersion version={version} />}
        <FooterCopyright
          year={year}
          companyName={companyName}
          rightsText={rightsText}
          companyLink={companyLink}
        />
        {statusIndicator && StatusIndicatorComponent && (
          <StatusIndicatorComponent
            statusPageUrl={statusIndicator.statusPageUrl}
            apiEndpoint={statusIndicator.apiEndpoint}
            refreshInterval={statusIndicator.refreshInterval || 60000}
            size='sm'
            version={version}
            isNetworkOnline={isNetworkOnline}
          />
        )}
      </FooterBottom>

      {socialLinks && (
        <div className='flex justify-center mt-4'>
          <FooterSocialLinks
            twitterUrl={socialLinks.twitterUrl}
            discordUrl={socialLinks.discordUrl}
            linkedinUrl={socialLinks.linkedinUrl}
            githubUrl={socialLinks.githubUrl}
            redditUrl={socialLinks.redditUrl}
            farcasterUrl={socialLinks.farcasterUrl}
            telegramUrl={socialLinks.telegramUrl}
          />
        </div>
      )}
    </FooterContainer>
  );
};

export default AppFooterForHomePage;
