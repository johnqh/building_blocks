/**
 * @fileoverview Type definitions for @sudobility/building_blocks
 *
 * @ai-context This file contains all TypeScript interfaces and types used across
 * the building_blocks component library. Types are organized by domain:
 * - Navigation (MenuItemConfig, LogoConfig, BreadcrumbItem)
 * - Footer (FooterLinkItem, FooterLinkSection, SocialLinksConfig)
 * - Layout (MaxWidth, ContentPadding, BackgroundVariant)
 * - Analytics (AnalyticsEventType, AnalyticsTrackingParams)
 *
 * @ai-pattern All interfaces use JSDoc comments with property descriptions.
 * Optional properties are marked with `?` suffix.
 */

import type { ComponentType, ReactNode } from 'react';

// Re-export LanguageConfig from constants
export type { LanguageConfig } from './constants/languages';

/**
 * Menu item configuration for AppTopBar navigation.
 *
 * @ai-context Used by AppTopBar, AppTopBarWithFirebaseAuth, AppTopBarWithWallet
 * @ai-usage Pass an array of these to the `menuItems` prop
 *
 * @example
 * ```tsx
 * const menuItems: MenuItemConfig[] = [
 *   { id: 'docs', label: 'Docs', icon: DocumentTextIcon, href: '/docs' },
 *   { id: 'settings', label: 'Settings', icon: Cog6ToothIcon, href: '/settings', show: isLoggedIn },
 * ];
 * ```
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

// ============================================================================
// Analytics Types
// ============================================================================

/**
 * Analytics tracking event types for building blocks components.
 *
 * @ai-context These event types categorize user interactions for analytics.
 * Each component uses specific event types based on its functionality.
 *
 * @ai-pattern Components call `onTrack` with these event types:
 * - AppFooter, AppFooterForHomePage: 'link_click'
 * - GlobalSettingsPage: 'settings_change'
 * - AppPricingPage: 'subscription_action'
 */
export type AnalyticsEventType =
  /** User clicked a button (e.g., CTA, submit) */
  | 'button_click'
  /** User clicked a navigation link */
  | 'link_click'
  /** User navigated to a different section/page */
  | 'navigation'
  /** User changed a setting (theme, font size, etc.) */
  | 'settings_change'
  /** User interacted with subscription/pricing (plan click, billing change) */
  | 'subscription_action'
  /** Page was viewed (typically tracked by router, not components) */
  | 'page_view';

/**
 * Analytics tracking parameters passed to onTrack callbacks.
 *
 * @ai-context This is the standard payload for all analytics events from
 * building_blocks components. The consuming app maps these to their
 * analytics provider (Firebase, Mixpanel, Segment, etc.).
 *
 * @ai-usage
 * ```tsx
 * const handleTrack = (params: AnalyticsTrackingParams) => {
 *   firebase.analytics().logEvent(params.label, {
 *     component: params.componentName,
 *     event_type: params.eventType,
 *     ...params.params,
 *   });
 * };
 * ```
 *
 * @example
 * ```typescript
 * // Example params from AppPricingPage
 * {
 *   eventType: 'subscription_action',
 *   componentName: 'AppPricingPage',
 *   label: 'plan_clicked',
 *   params: { plan_identifier: 'pro_monthly', action_type: 'upgrade' }
 * }
 *
 * // Example params from AppFooter
 * {
 *   eventType: 'link_click',
 *   componentName: 'AppFooter',
 *   label: 'footer_link_clicked',
 *   params: { link_label: 'Privacy', link_href: '/privacy' }
 * }
 * ```
 */
export interface AnalyticsTrackingParams {
  /** Type of event being tracked (categorizes the interaction) */
  eventType: AnalyticsEventType;
  /** Component name where the event originated (e.g., 'AppPricingPage') */
  componentName: string;
  /** Human-readable label for the action (e.g., 'plan_clicked', 'theme_changed') */
  label: string;
  /** Additional context-specific parameters (varies by component and action) */
  params?: Record<string, unknown>;
}

/**
 * Analytics tracking callback interface for components.
 *
 * @ai-context Components that support analytics accept an optional `onTrack` prop
 * of type `(params: AnalyticsTrackingParams) => void`. This interface is provided
 * for consumers who want to type their tracking implementation.
 *
 * @ai-pattern To add analytics to a component:
 * 1. Add `onTrack?: (params: AnalyticsTrackingParams) => void` to props
 * 2. Create a track helper: `const track = (label, params) => onTrack?.({...})`
 * 3. Call `track()` on user interactions
 */
export interface AnalyticsTracker {
  /**
   * Track an analytics event.
   * @param params The tracking parameters including event type, component, label, and custom params
   */
  onTrack: (params: AnalyticsTrackingParams) => void;
}
