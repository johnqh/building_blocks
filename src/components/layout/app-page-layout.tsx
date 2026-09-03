import React, { type ReactNode } from 'react';
import {
  LayoutProvider,
  AspectFitView,
  type LayoutMode,
} from '@sudobility/components';
import { cva } from 'class-variance-authority';
import { cn } from '../../utils';
import { ui } from '@sudobility/design';
import {
  AppBreadcrumbs,
  type AppBreadcrumbsProps,
} from '../breadcrumbs/app-breadcrumbs';
import { AppTopBar, type AppTopBarProps } from '../topbar/app-topbar';
import {
  AppTopBarWithFirebaseAuth,
  type AppTopBarWithFirebaseAuthProps,
} from '../topbar/app-topbar-with-firebase-auth';
import {
  AppTopBarWithWallet,
  type AppTopBarWithWalletProps,
} from '../topbar/app-topbar-with-wallet';
import { AppFooter, type AppFooterProps } from '../footer/app-footer';
import {
  AppFooterForHomePage,
  type AppFooterForHomePageProps,
} from '../footer/app-footer-for-home-page';
import type { MaxWidth, ContentPadding, BackgroundVariant } from '../../types';

const layoutVariants = cva('flex flex-col', {
  variants: {
    background: {
      default: ui.background.subtle,
      white: 'bg-background',
      gradient: 'bg-gradient-to-br from-background to-muted',
    },
  },
  defaultVariants: {
    background: 'default',
  },
});

const maxWidthClasses: Record<MaxWidth, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '4xl': 'max-w-4xl',
  '5xl': 'max-w-5xl',
  '7xl': 'max-w-7xl',
  full: 'max-w-full',
};

const paddingClasses: Record<ContentPadding, string> = {
  none: '',
  sm: 'px-4 sm:px-6 py-6',
  md: 'px-4 py-8',
  lg: 'px-4 py-12',
};

/** Discriminated union for selecting which TopBar component to render. */
export type TopBarConfig =
  | ({ variant: 'base'; topBarVariant?: 'default' | 'app' } & Omit<
      AppTopBarProps,
      'variant'
    >)
  | ({ variant: 'firebase'; topBarVariant?: 'default' | 'app' } & Omit<
      AppTopBarWithFirebaseAuthProps,
      'variant'
    >)
  | ({ variant: 'wallet'; topBarVariant?: 'default' | 'app' } & Omit<
      AppTopBarWithWalletProps,
      'variant'
    >);

/** Discriminated union for selecting which Footer component to render. */
export type FooterConfig =
  | ({ variant: 'compact' } & AppFooterProps)
  | ({ variant: 'full' } & AppFooterForHomePageProps);

function renderTopBar(config: TopBarConfig): ReactNode {
  const { variant, topBarVariant, ...rest } = config;
  switch (variant) {
    case 'base':
      return (
        <AppTopBar
          variant={topBarVariant}
          {...(rest as Omit<AppTopBarProps, 'variant'>)}
        />
      );
    case 'firebase':
      return (
        <AppTopBarWithFirebaseAuth
          variant={topBarVariant}
          {...(rest as Omit<AppTopBarWithFirebaseAuthProps, 'variant'>)}
        />
      );
    case 'wallet':
      return (
        <AppTopBarWithWallet
          variant={topBarVariant}
          {...(rest as Omit<AppTopBarWithWalletProps, 'variant'>)}
        />
      );
  }
}

function renderFooter(config: FooterConfig): ReactNode {
  const { variant, ...rest } = config;
  switch (variant) {
    case 'compact':
      return <AppFooter {...(rest as AppFooterProps)} />;
    case 'full':
      return <AppFooterForHomePage {...(rest as AppFooterForHomePageProps)} />;
  }
}

/** Page-level layout and styling options. */
export interface AppPageProps {
  /**
   * Max width for the content area (default: '5xl' -- 1024px).
   *
   * Caps body content at a readable line length while `layoutMode` keeps the
   * chrome spanning the browser. A `Section` bleeds its band back out of this
   * cap, so full-width backgrounds still work; pass 'full' to remove the cap
   * for a page that manages its own width.
   */
  maxWidth?: MaxWidth;

  /** Content padding (default: 'md') */
  contentPadding?: ContentPadding;

  /** Background variant */
  background?: BackgroundVariant;

  /**
   * Width mode for the whole page, handed to `LayoutProvider`.
   *
   * This is what the topbar, breadcrumbs and footer read for their own width,
   * so it — not `maxWidth`, which only sizes the content area — is how a page
   * goes wide or full without its chrome disagreeing with its content.
   *
   * Defaults to 'full': the chrome spans the browser width unless it asks not
   * to. Note this is independent of `maxWidth`, which caps the content area at
   * the reading width -- the chrome going wide is not the text going wide.
   * Pass 'standard' for the old max-w-7xl column.
   */
  layoutMode?: LayoutMode;

  /** Custom className for the layout container */
  className?: string;

  /** Custom className for the content area */
  contentClassName?: string;

  /** Custom className for the main element */
  mainClassName?: string;

  /** Whether the content area should be scrollable in sticky layout mode (default: true).
   *  Set to false for pages with MasterDetailLayout where panels handle their own scrolling. */
  scrollable?: boolean;

  /** Optional aspect ratio (width / height) for content area. When set, children are placed inside a container with fixed aspect ratio using AspectFit behavior. */
  aspectRatio?: number;
}

export interface AppPageLayoutProps {
  /** Page content */
  children: ReactNode;

  /** TopBar configuration - selects which TopBar component to render */
  topBar: TopBarConfig;

  /** Breadcrumbs configuration (optional) */
  breadcrumbs?: AppBreadcrumbsProps;

  /** Footer configuration - selects which Footer component to render */
  footer?: FooterConfig;

  /** Page-level layout and styling options */
  page?: AppPageProps;
}

/**
 * AppPageLayout - Layout wrapper combining TopBar, Breadcrumbs, Content, and Footer.
 *
 * Features:
 * - Props-based TopBar and Footer via discriminated unions
 * - Optional breadcrumbs with share and "Talk to Founder"
 * - Configurable content max-width and padding
 * - Background variants
 * - Dark mode support
 * - Compact footer sticks to the bottom while content scrolls independently
 * - Full footer scrolls with content (no sticky behavior)
 *
 * @example
 * ```tsx
 * <AppPageLayout
 *   topBar={{
 *     variant: 'firebase',
 *     logo: { src: '/logo.png', appName: 'My App' },
 *     menuItems: menuItems,
 *     AuthActionComponent: AuthAction,
 *     onLoginClick: () => navigate('/login'),
 *   }}
 *   breadcrumbs={{
 *     items: breadcrumbItems,
 *     shareConfig: { title: 'Page', description: 'Description', hashtags: [] },
 *   }}
 *   footer={{
 *     variant: 'compact',
 *     version: '1.0.0',
 *     companyName: 'My Company',
 *     links: [{ label: 'Privacy', href: '/privacy' }],
 *   }}
 *   page={{ maxWidth: '5xl', background: 'default' }}
 * >
 *   <h1>Page Content</h1>
 * </AppPageLayout>
 * ```
 */
export const AppPageLayout: React.FC<AppPageLayoutProps> = ({
  children,
  topBar,
  breadcrumbs,
  footer,
  page,
}) => {
  const {
    maxWidth = '5xl',
    contentPadding = 'md',
    background = 'default',
    layoutMode = 'full',
    className,
    contentClassName,
    mainClassName,
    scrollable = true,
    aspectRatio,
  } = page ?? {};
  const isCompactFooter = footer?.variant === 'compact';
  // Compact footer: viewport-locked layout with internal scrolling
  // Full footer: natural page scrolling so footer scrolls with content
  const stickyLayout = !footer || isCompactFooter;
  const content = aspectRatio ? (
    <AspectFitView aspectRatio={aspectRatio}>{children}</AspectFitView>
  ) : (
    children
  );

  return (
    <LayoutProvider mode={layoutMode}>
      <div
        className={cn(
          layoutVariants({ background }),
          stickyLayout ? 'h-screen overflow-hidden' : 'min-h-screen',
          className
        )}
      >
        {/* Header Section */}
        <header>{renderTopBar(topBar)}</header>

        {/* Breadcrumb Section */}
        {breadcrumbs && breadcrumbs.items && breadcrumbs.items.length > 0 && (
          <AppBreadcrumbs {...breadcrumbs} />
        )}

        {/* Main Content */}
        <main
          className={cn(
            'flex-1',
            stickyLayout && 'flex flex-col overflow-hidden',
            mainClassName
          )}
        >
          <div
            className={cn(
              'mx-auto',
              maxWidthClasses[maxWidth],
              paddingClasses[contentPadding],
              stickyLayout &&
                (scrollable
                  ? 'flex-1 min-h-0 overflow-auto'
                  : 'flex-1 min-h-0 overflow-hidden flex flex-col'),
              contentClassName
            )}
          >
            {content}
          </div>
        </main>

        {/* Footer */}
        {footer && (
          <footer
            className={isCompactFooter ? 'sticky bottom-0 z-10' : undefined}
          >
            {renderFooter(footer)}
          </footer>
        )}
      </div>
    </LayoutProvider>
  );
};

export default AppPageLayout;
