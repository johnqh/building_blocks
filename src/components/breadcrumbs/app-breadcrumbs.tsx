import React, { type ComponentType } from 'react';
import { BreadcrumbSection } from '@sudobility/components';
import { CalendarDaysIcon } from '@heroicons/react/24/outline';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils';
import type {
  BreadcrumbItem,
  ShareConfig,
  TalkToFounderConfig,
  LinkComponentProps,
} from '../../types';

const breadcrumbContainerVariants = cva('border-b', {
  variants: {
    variant: {
      default: 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700',
      transparent: 'bg-transparent border-transparent',
      subtle:
        'bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

export interface AppBreadcrumbsProps extends VariantProps<
  typeof breadcrumbContainerVariants
> {
  /** Breadcrumb items */
  items: BreadcrumbItem[];

  /** Share configuration (shows social share buttons on right) */
  shareConfig?: ShareConfig;

  /** Talk to founder button configuration */
  talkToFounder?: TalkToFounderConfig;

  /** Custom Link component */
  LinkComponent?: ComponentType<LinkComponentProps>;

  /** Custom className for the container */
  className?: string;

  /** Custom className for the inner content */
  contentClassName?: string;
}

/**
 * Default Talk to Founder button.
 */
const TalkToFounderButton: React.FC<{
  config: TalkToFounderConfig;
}> = ({ config }) => {
  const IconComponent = config.icon || CalendarDaysIcon;
  const buttonText = config.buttonText || 'Talk to Founder';

  return (
    <a
      href={config.meetingUrl}
      target='_blank'
      rel='noopener noreferrer'
      className={cn(
        'inline-flex items-center gap-2 px-3 py-1.5',
        'text-sm font-medium',
        'text-blue-600 dark:text-blue-400',
        'hover:text-blue-700 dark:hover:text-blue-300',
        'bg-blue-50 dark:bg-blue-900/20',
        'hover:bg-blue-100 dark:hover:bg-blue-900/30',
        'rounded-full',
        'border border-blue-200 dark:border-blue-800',
        'transition-colors'
      )}
    >
      <IconComponent className='h-4 w-4' />
      <span>{buttonText}</span>
    </a>
  );
};

/**
 * AppBreadcrumbs - Breadcrumb navigation with social share and "Talk to Founder" button.
 *
 * Features:
 * - Breadcrumb trail with links
 * - Social share buttons on the right
 * - Optional "Talk to Founder" meeting button
 * - Always renders at max-w-7xl width
 * - Dark mode support
 *
 * @example
 * ```tsx
 * <AppBreadcrumbs
 *   items={[
 *     { label: 'Home', href: '/' },
 *     { label: 'Products', href: '/products' },
 *     { label: 'Widget', current: true },
 *   ]}
 *   shareConfig={{
 *     title: 'Check out this widget',
 *     description: 'Amazing widget for your needs',
 *     hashtags: ['widget', 'product'],
 *   }}
 *   talkToFounder={{
 *     meetingUrl: 'https://calendly.com/founder/30min',
 *     buttonText: 'Book a call',
 *   }}
 * />
 * ```
 */
export const AppBreadcrumbs: React.FC<AppBreadcrumbsProps> = ({
  items,
  shareConfig,
  talkToFounder,
  variant = 'default',
  className,
  contentClassName,
}) => {
  // Don't render if no items or only home
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div className={cn(breadcrumbContainerVariants({ variant }), className)}>
      <div className={cn('max-w-7xl mx-auto px-4 py-3', contentClassName)}>
        <div className='flex items-center justify-between gap-4'>
          {/* Breadcrumb trail */}
          <div className='flex-1 min-w-0'>
            <BreadcrumbSection items={items} shareConfig={shareConfig} />
          </div>

          {/* Right side: Talk to Founder + Share (if shareConfig, share is handled by BreadcrumbSection) */}
          {talkToFounder && (
            <div className='flex items-center gap-3 flex-shrink-0'>
              <TalkToFounderButton config={talkToFounder} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AppBreadcrumbs;
