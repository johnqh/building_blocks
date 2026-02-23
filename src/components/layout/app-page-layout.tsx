import React, { type ReactNode } from 'react';
import { LayoutProvider, AspectFitView } from '@sudobility/components';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils';
import {
  AppBreadcrumbs,
  type AppBreadcrumbsProps,
} from '../breadcrumbs/app-breadcrumbs';
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

export interface AppPageLayoutProps extends VariantProps<
  typeof layoutVariants
> {
  /** Page content */
  children: ReactNode;

  /** TopBar slot - pass an AppTopBar variant or custom component */
  topBar: ReactNode;

  /** Breadcrumbs configuration (optional) */
  breadcrumbs?: AppBreadcrumbsProps;

  /** Footer slot - pass an AppFooter variant or custom component */
  footer?: ReactNode;

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

/**
 * AppPageLayout - Layout wrapper combining TopBar, Breadcrumbs, Content, and Footer.
 *
 * Features:
 * - Flexible slots for TopBar and Footer
 * - Optional breadcrumbs with share and "Talk to Founder"
 * - Configurable content max-width and padding
 * - Background variants
 * - Dark mode support
 * - Sticky footer behavior
 *
 * @example
 * ```tsx
 * <AppPageLayout
 *   topBar={
 *     <AppTopBarWithFirebaseAuth
 *       logo={{ src: '/logo.png', appName: 'My App' }}
 *       menuItems={menuItems}
 *       AuthActionComponent={AuthAction}
 *       onLoginClick={() => navigate('/login')}
 *     />
 *   }
 *   breadcrumbs={{
 *     items: breadcrumbItems,
 *     shareConfig: { title: 'Page', description: 'Description', hashtags: [] },
 *   }}
 *   footer={
 *     <AppFooter
 *       version="1.0.0"
 *       companyName="My Company"
 *       links={[{ label: 'Privacy', href: '/privacy' }]}
 *     />
 *   }
 *   maxWidth="7xl"
 *   background="default"
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
  maxWidth = '7xl',
  contentPadding = 'md',
  background = 'default',
  layoutMode = 'standard',
  className,
  contentClassName,
  mainClassName,
  aspectRatio,
}) => {
  // Development-only warnings for common misconfigurations
  if (process.env.NODE_ENV !== 'production') {
    if (!topBar) {
      console.warn(
        '[AppPageLayout] No topBar provided. The layout will render without a navigation bar. ' +
          'Pass an AppTopBar variant or custom component via the topBar prop.'
      );
    }
  }
  const content = aspectRatio ? (
    <AspectFitView aspectRatio={aspectRatio}>{children}</AspectFitView>
  ) : (
    children
  );

  return (
    <LayoutProvider mode={layoutMode}>
      <div className={cn(layoutVariants({ background }), className)}>
        {/* Header Section */}
        <header>{topBar}</header>

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
        {footer && <footer>{footer}</footer>}
      </div>
    </LayoutProvider>
  );
};

export default AppPageLayout;
