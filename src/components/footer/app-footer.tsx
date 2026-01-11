import React, { useCallback, type ComponentType } from 'react';
import {
  Footer as FooterContainer,
  FooterCompact,
  FooterCompactLeft,
  FooterCompactRight,
  FooterVersion,
  FooterCopyright,
} from '@sudobility/components';
import { cn } from '../../utils';
import type {
  StatusIndicatorConfig,
  LinkComponentProps,
  FooterLinkItem,
  AnalyticsTrackingParams,
} from '../../types';

/**
 * Props for the SystemStatusIndicator component from @sudobility/devops-components.
 */
export interface SystemStatusIndicatorProps {
  statusPageUrl: string;
  apiEndpoint?: string;
  refreshInterval?: number;
  size?: 'sm' | 'md' | 'lg';
  version?: string;
  isNetworkOnline?: boolean;
}

export interface AppFooterProps {
  /** App version string */
  version?: string;

  /** Copyright year or range (e.g., "2025" or "2025-2026") */
  copyrightYear?: string;

  /** Company name */
  companyName: string;

  /** Company URL (optional - creates a link if provided) */
  companyUrl?: string;

  /** Rights text (e.g., "All rights reserved") */
  rightsText?: string;

  /** Status indicator config (optional) */
  statusIndicator?: StatusIndicatorConfig;

  /**
   * SystemStatusIndicator component from @sudobility/devops-components.
   * Pass this to enable status indicator functionality.
   */
  StatusIndicatorComponent?: ComponentType<SystemStatusIndicatorProps>;

  /** Right-side links (e.g., Privacy, Terms) */
  links?: FooterLinkItem[];

  /** Custom Link component */
  LinkComponent?: ComponentType<LinkComponentProps>;

  /** Sticky positioning (sticks to bottom of viewport) */
  sticky?: boolean;

  /** Network online status (for status indicator) */
  isNetworkOnline?: boolean;

  /** Custom className */
  className?: string;

  /** Optional analytics tracking callback */
  onTrack?: (params: AnalyticsTrackingParams) => void;
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
 * AppFooter - Compact footer for app pages.
 *
 * Features:
 * - Version display
 * - Copyright with company name
 * - System status indicator (optional)
 * - Right-side links (Privacy, Terms, etc.)
 * - Sticky positioning option
 * - Dark mode support
 *
 * @example
 * ```tsx
 * import { SystemStatusIndicator } from '@sudobility/devops-components';
 *
 * <AppFooter
 *   version="1.0.0"
 *   companyName="Sudobility Inc."
 *   companyUrl="/"
 *   rightsText="All rights reserved"
 *   statusIndicator={{
 *     statusPageUrl: 'https://status.example.com',
 *     apiEndpoint: 'https://status.example.com/api/v1/status',
 *   }}
 *   StatusIndicatorComponent={SystemStatusIndicator}
 *   links={[
 *     { label: 'Privacy', href: '/privacy' },
 *     { label: 'Terms', href: '/terms' },
 *   ]}
 *   sticky
 * />
 * ```
 */
export const AppFooter: React.FC<AppFooterProps> = ({
  version,
  copyrightYear,
  companyName,
  companyUrl,
  rightsText = 'All rights reserved',
  statusIndicator,
  StatusIndicatorComponent,
  links = [],
  LinkComponent = DefaultLinkComponent,
  sticky = true,
  isNetworkOnline = true,
  className,
  onTrack,
}) => {
  const year = copyrightYear || getCopyrightYear();

  // Helper to track analytics events
  const track = useCallback(
    (label: string, params?: Record<string, unknown>) => {
      onTrack?.({
        eventType: 'link_click',
        componentName: 'AppFooter',
        label,
        params,
      });
    },
    [onTrack]
  );

  // Create a tracked link click handler
  const createTrackedLinkHandler = useCallback(
    (
      linkLabel: string,
      linkHref: string,
      originalOnClick?: (e: React.MouseEvent) => void
    ) =>
      (e: React.MouseEvent) => {
        track('footer_link_clicked', {
          link_label: linkLabel,
          link_href: linkHref,
        });
        originalOnClick?.(e);
      },
    [track]
  );

  const companyLink = companyUrl ? (
    <LinkComponent
      href={companyUrl}
      className='text-blue-400 hover:text-blue-300 transition-colors'
    >
      {companyName}
    </LinkComponent>
  ) : undefined;

  return (
    <FooterContainer
      variant='compact'
      sticky={sticky}
      className={cn(className)}
    >
      <FooterCompact>
        <FooterCompactLeft>
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
        </FooterCompactLeft>
        <FooterCompactRight>
          {links.map((link, index) => (
            <React.Fragment key={link.href || index}>
              {link.onClick ? (
                <button
                  onClick={createTrackedLinkHandler(
                    link.label,
                    link.href,
                    link.onClick
                  )}
                  className='text-gray-400 hover:text-white transition-colors'
                >
                  {link.label}
                </button>
              ) : (
                <LinkComponent
                  href={link.href}
                  onClick={createTrackedLinkHandler(link.label, link.href)}
                  className='text-gray-400 hover:text-white transition-colors'
                >
                  {link.label}
                </LinkComponent>
              )}
            </React.Fragment>
          ))}
        </FooterCompactRight>
      </FooterCompact>
    </FooterContainer>
  );
};

export default AppFooter;
