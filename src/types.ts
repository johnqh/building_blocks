import type { ComponentType, ReactNode } from 'react';

// Re-export LanguageConfig from constants
export type { LanguageConfig } from './constants/languages';

/**
 * Menu item configuration for AppTopBar navigation.
 */
export interface MenuItemConfig {
  /** Unique identifier for the menu item */
  id: string;
  /** Display label */
  label: string;
  /** HeroIcon component or any icon component */
  icon: ComponentType<{ className?: string }>;
  /** Navigation href */
  href: string;
  /** Optional: show only when condition is true */
  show?: boolean;
}

/**
 * Logo configuration for AppTopBar.
 */
export interface LogoConfig {
  /** Path to logo image (e.g., '/logo.png') */
  src: string;
  /** Alt text for the logo */
  alt?: string;
  /** App name to display next to logo */
  appName: string;
  /** Logo click handler (typically navigate to home) */
  onClick?: () => void;
}

/**
 * Custom Link component interface for router integration.
 */
export interface LinkComponentProps {
  href: string;
  className?: string;
  children: ReactNode;
  onClick?: (e: React.MouseEvent) => void;
}

/**
 * Breadcrumb item configuration.
 */
export interface BreadcrumbItem {
  /** Display label */
  label: string;
  /** Optional href for navigation (no href = current page) */
  href?: string;
  /** Whether this is the current page */
  current?: boolean;
}

/**
 * Social share configuration for breadcrumbs.
 */
export interface ShareConfig {
  /** Share title */
  title: string;
  /** Share description */
  description: string;
  /** Hashtags for social sharing */
  hashtags: string[];
  /** Optional callback to modify share URL before sharing */
  onBeforeShare?: (baseUrl: string) => Promise<string>;
}

/**
 * "Talk to Founder" button configuration.
 */
export interface TalkToFounderConfig {
  /** Meeting scheduling URL (e.g., Calendly link) */
  meetingUrl: string;
  /** Button text (default: "Talk to Founder") */
  buttonText?: string;
  /** Optional icon component (default: CalendarIcon) */
  icon?: ComponentType<{ className?: string }>;
}

/**
 * Footer link item.
 */
export interface FooterLinkItem {
  /** Display label */
  label: string;
  /** Link href */
  href: string;
  /** Optional click handler */
  onClick?: (e: React.MouseEvent) => void;
}

/**
 * Footer link section (for full footer).
 */
export interface FooterLinkSection {
  /** Section title */
  title: string;
  /** Links in this section */
  links: FooterLinkItem[];
}

/**
 * Social media links configuration.
 */
export interface SocialLinksConfig {
  twitterUrl?: string;
  discordUrl?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  redditUrl?: string;
  farcasterUrl?: string;
  telegramUrl?: string;
}

/**
 * System status indicator configuration.
 */
export interface StatusIndicatorConfig {
  /** Status page URL (for clicking the indicator) */
  statusPageUrl: string;
  /** API endpoint for fetching status */
  apiEndpoint?: string;
  /** Refresh interval in ms (default: 60000) */
  refreshInterval?: number;
}

/**
 * Max width options for layout.
 */
export type MaxWidth =
  | 'sm'
  | 'md'
  | 'lg'
  | 'xl'
  | '2xl'
  | '4xl'
  | '7xl'
  | 'full';

/**
 * Content padding options.
 */
export type ContentPadding = 'none' | 'sm' | 'md' | 'lg';

/**
 * Background variant options.
 */
export type BackgroundVariant = 'default' | 'white' | 'gradient';
