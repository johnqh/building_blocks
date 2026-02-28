import React, { type ReactNode } from 'react';
import { LayoutProvider, AspectFitView } from '@sudobility/components';
import { cva } from 'class-variance-authority';
import { cn } from '../../utils';
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

const layoutVariants = cva('min-h-screen flex flex-col', {
  variants: {
    background: {
      default: 'bg-gray-50 dark:bg-gray-900',
      white: 'bg-white dark:bg-gray-900',
      gradient:
        'bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800',
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
  /** Max width for content area (default: '7xl') */
  maxWidth?: MaxWidth;

  /** Content padding (default: 'md') */
  contentPadding?: ContentPadding;

  /** Background variant */
  background?: BackgroundVariant;

  /** Layout mode for LayoutProvider */
  layoutMode?: 'standard';

  /** Custom className for the layout container */
  className?: string;

  /** Custom className for the content area */
  contentClassName?: string;

  /** Custom className for the main element */
  mainClassName?: string;

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
 * - Sticky footer behavior (automatic for compact footer)
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
 *   page={{ maxWidth: '7xl', background: 'default' }}
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
    maxWidth = '7xl',
    contentPadding = 'md',
    background = 'default',
    layoutMode = 'standard',
    className,
    contentClassName,
    mainClassName,
    aspectRatio,
  } = page ?? {};
  const isCompactFooter = footer?.variant === 'compact';
  const content = aspectRatio ? (
    <AspectFitView aspectRatio={aspectRatio}>{children}</AspectFitView>
  ) : (
    children
  );

  return (
    <LayoutProvider mode={layoutMode}>
      <div className={cn(layoutVariants({ background }), className)}>
        {/* Header Section */}
        <header>{renderTopBar(topBar)}</header>

        {/* Breadcrumb Section */}
        {breadcrumbs && breadcrumbs.items && breadcrumbs.items.length > 0 && (
          <AppBreadcrumbs {...breadcrumbs} />
        )}

        {/* Main Content */}
        <main className={cn('flex-1 overflow-auto', mainClassName)}>
          <div
            className={cn(
              'mx-auto',
              maxWidthClasses[maxWidth],
              paddingClasses[contentPadding],
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
