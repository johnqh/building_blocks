import React, { useState, type ComponentType } from 'react';
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

// Social media share URL generators
const createShareUrl = {
  twitter: (url: string, text: string, hashtags: string[]) => {
    const hashtagStr =
      hashtags.length > 0 ? `&hashtags=${hashtags.join(',')}` : '';
    return `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}${hashtagStr}`;
  },
  facebook: (url: string) => {
    return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
  },
  linkedin: (url: string) => {
    return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
  },
  reddit: (url: string, title: string) => {
    return `https://reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`;
  },
  telegram: (url: string, text: string) => {
    return `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
  },
  email: (url: string, title: string, description: string) => {
    return `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(description + '\n\n' + url)}`;
  },
};

/**
 * Share dropdown component
 */
const ShareDropdown: React.FC<{ shareConfig: ShareConfig }> = ({
  shareConfig,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState<string>('');
  const [isPreparingShare, setIsPreparingShare] = useState(false);
  const [showCopiedFeedback, setShowCopiedFeedback] = useState(false);

  React.useEffect(() => {
    const onBeforeShare = shareConfig.onBeforeShare;
    if (onBeforeShare && !shareUrl) {
      const prepareUrl = async () => {
        setIsPreparingShare(true);
        try {
          const baseUrl =
            typeof window !== 'undefined' ? window.location.href : '';
          const modifiedUrl = await onBeforeShare(baseUrl);
          setShareUrl(modifiedUrl);
        } catch {
          const baseUrl =
            typeof window !== 'undefined' ? window.location.href : '';
          setShareUrl(baseUrl);
        } finally {
          setIsPreparingShare(false);
        }
      };
      prepareUrl();
    }
  }, [shareConfig, shareUrl]);

  const url =
    shareUrl || (typeof window !== 'undefined' ? window.location.href : '');

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setShowCopiedFeedback(true);
      setTimeout(() => {
        setShowCopiedFeedback(false);
        setIsOpen(false);
      }, 1500);
    } catch {
      // Copy failed
    }
  };

  const handleSocialShare = (platformUrl: string) => {
    window.open(
      platformUrl,
      '_blank',
      'noopener,noreferrer,width=600,height=400'
    );
    setIsOpen(false);
  };

  const sharePlatforms = [
    {
      name: 'Twitter',
      url: createShareUrl.twitter(url, shareConfig.title, shareConfig.hashtags),
      color: 'text-blue-400',
    },
    {
      name: 'Facebook',
      url: createShareUrl.facebook(url),
      color: 'text-blue-600',
    },
    {
      name: 'LinkedIn',
      url: createShareUrl.linkedin(url),
      color: 'text-blue-700',
    },
    {
      name: 'Reddit',
      url: createShareUrl.reddit(url, shareConfig.title),
      color: 'text-orange-600',
    },
    {
      name: 'Telegram',
      url: createShareUrl.telegram(url, shareConfig.title),
      color: 'text-blue-500',
    },
    {
      name: 'Email',
      url: createShareUrl.email(
        url,
        shareConfig.title,
        shareConfig.description
      ),
      color: 'text-gray-600',
    },
  ];

  return (
    <div className='relative'>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isPreparingShare}
        className='flex items-center justify-center w-8 h-8 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
        title='Share this page'
      >
        {isPreparingShare ? (
          <div className='w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin' />
        ) : (
          <svg
            className='w-4 h-4'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z'
            />
          </svg>
        )}
      </button>

      {isOpen && (
        <>
          <div
            className='fixed inset-0 z-[999998]'
            onClick={() => setIsOpen(false)}
          />
          <div className='absolute right-0 top-10 z-[999999] w-40 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-1'>
            {sharePlatforms.map(platform => (
              <button
                key={platform.name}
                onClick={() => handleSocialShare(platform.url)}
                className='w-full flex items-center px-3 py-1.5 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors'
              >
                <span className={`text-sm ${platform.color}`}>
                  {platform.name}
                </span>
              </button>
            ))}
            <div className='border-t border-gray-200 dark:border-gray-700 my-1' />
            <button
              onClick={copyToClipboard}
              className='w-full flex items-center px-3 py-1.5 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors'
            >
              <span className='text-sm text-gray-700 dark:text-gray-300'>
                {showCopiedFeedback ? 'Copied!' : 'Copy Link'}
              </span>
            </button>
          </div>
        </>
      )}
    </div>
  );
};

/**
 * Talk to Founder button - matches share button style
 */
const TalkToFounderButton: React.FC<{ config: TalkToFounderConfig }> = ({
  config,
}) => {
  const IconComponent = config.icon || CalendarDaysIcon;
  const buttonText = config.buttonText || 'Talk to Founder';

  return (
    <a
      href={config.meetingUrl}
      target='_blank'
      rel='noopener noreferrer'
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 h-8',
        'text-sm font-medium',
        'text-blue-600 dark:text-blue-400',
        'hover:text-blue-700 dark:hover:text-blue-300',
        'bg-blue-50 dark:bg-blue-900/30',
        'hover:bg-blue-100 dark:hover:bg-blue-900/50',
        'rounded-lg',
        'transition-colors'
      )}
    >
      <IconComponent className='h-4 w-4' />
      <span>{buttonText}</span>
    </a>
  );
};

/**
 * AppBreadcrumbs - Self-contained breadcrumb navigation with share and "Talk to Founder" button.
 */
export const AppBreadcrumbs: React.FC<AppBreadcrumbsProps> = ({
  items,
  shareConfig,
  talkToFounder,
  variant = 'default',
  className,
  contentClassName,
}) => {
  // Don't render if no items
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div className={cn(breadcrumbContainerVariants({ variant }), className)}>
      <div className={cn('max-w-7xl mx-auto px-4 py-2', contentClassName)}>
        <div className='flex items-center justify-between'>
          {/* Breadcrumb trail */}
          <nav aria-label='Breadcrumb'>
            <ol className='flex items-center text-sm space-x-2'>
              {items.map((item, index) => (
                <React.Fragment key={index}>
                  <li>
                    {item.current || !item.href ? (
                      <span className='text-gray-700 dark:text-gray-300'>
                        {item.label}
                      </span>
                    ) : (
                      <a
                        href={item.href}
                        className='text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors'
                      >
                        {item.label}
                      </a>
                    )}
                  </li>
                  {index < items.length - 1 && (
                    <li>
                      <span className='text-gray-400 dark:text-gray-500'>
                        /
                      </span>
                    </li>
                  )}
                </React.Fragment>
              ))}
            </ol>
          </nav>

          {/* Right side: Talk to Founder + Share */}
          <div className='flex items-center gap-2'>
            {talkToFounder && <TalkToFounderButton config={talkToFounder} />}
            {shareConfig && <ShareDropdown shareConfig={shareConfig} />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppBreadcrumbs;
