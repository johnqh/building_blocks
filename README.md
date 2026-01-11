# @sudobility/building_blocks

Higher-level shared UI building blocks for Sudobility apps. These components integrate with authentication, wallet connection, i18n, routing, and analytics tracking.

## Installation

```bash
bun add @sudobility/building_blocks
```

## Peer Dependencies

Required:
- `@sudobility/components` - Base UI components
- `@sudobility/design` - Design tokens and styling
- `@heroicons/react` - Icon library
- `react` (^18.0.0 || ^19.0.0)
- `class-variance-authority`, `clsx`, `tailwind-merge` - Styling utilities

Optional (for specific features):
- `@sudobility/auth-components` - For Firebase auth integration
- `@sudobility/web3-components` - For wallet connection
- `@sudobility/devops-components` - For status indicator
- `@sudobility/subscription-components` - For pricing/subscription pages
- `@sudobility/types` - For Theme, FontSize enums

## Components

### TopBar Components

#### AppTopBar (Base)
Base topbar with logo, menu items, language selector, and render prop for auth.

```tsx
import { AppTopBar } from '@sudobility/building_blocks';
import { Cog6ToothIcon, DocumentTextIcon } from '@heroicons/react/24/outline';

<AppTopBar
  logo={{
    src: '/logo.png',
    appName: 'My App',
    onClick: () => navigate('/'),
  }}
  menuItems={[
    { id: 'docs', label: 'Docs', icon: DocumentTextIcon, href: '/docs' },
    { id: 'settings', label: 'Settings', icon: Cog6ToothIcon, href: '/settings' },
  ]}
  currentLanguage="en"
  onLanguageChange={(lang) => switchLanguage(lang)}
  renderAccountSection={() => <MyAuthButton />}
  LinkComponent={LocalizedLink}
/>
```

#### AppTopBarWithFirebaseAuth
TopBar with Firebase authentication via @sudobility/auth-components.

```tsx
import { AppTopBarWithFirebaseAuth } from '@sudobility/building_blocks';
import { AuthAction } from '@sudobility/auth-components';

<AppTopBarWithFirebaseAuth
  logo={{ src: '/logo.png', appName: 'My App' }}
  menuItems={menuItems}
  AuthActionComponent={AuthAction}
  onLoginClick={() => navigate('/login')}
  authenticatedMenuItems={[
    { id: 'dashboard', label: 'Dashboard', onClick: () => navigate('/dashboard') },
  ]}
/>
```

#### AppTopBarWithWallet
TopBar with wallet connection via @sudobility/web3-components.

```tsx
import { AppTopBarWithWallet } from '@sudobility/building_blocks';
import { WalletDropdownMenu } from '@sudobility/web3-components';

<AppTopBarWithWallet
  logo={{ src: '/logo.png', appName: 'My App' }}
  menuItems={menuItems}
  WalletDropdownMenuComponent={WalletDropdownMenu}
  isConnected={isConnected}
  walletAddress={walletAddress}
  authStatus={authStatus}
  onConnect={() => navigate('/connect')}
  onDisconnect={handleDisconnect}
  walletMenuItems={walletMenuItems}
/>
```

### Breadcrumbs

#### AppBreadcrumbs
Breadcrumbs with social share and "Talk to Founder" button.

```tsx
import { AppBreadcrumbs } from '@sudobility/building_blocks';

<AppBreadcrumbs
  items={[
    { label: 'Home', href: '/' },
    { label: 'Products', href: '/products' },
    { label: 'Widget', current: true },
  ]}
  shareConfig={{
    title: 'Check out this widget',
    description: 'Amazing widget for your needs',
    hashtags: ['widget', 'product'],
  }}
  talkToFounder={{
    meetingUrl: 'https://calendly.com/founder/30min',
    buttonText: 'Book a call',
  }}
/>
```

### Footer Components

#### AppFooter (Compact)
Compact footer for app pages with sticky positioning.

```tsx
import { AppFooter } from '@sudobility/building_blocks';
import { SystemStatusIndicator } from '@sudobility/devops-components';

<AppFooter
  version="1.0.0"
  companyName="Sudobility Inc."
  companyUrl="/"
  statusIndicator={{
    statusPageUrl: 'https://status.example.com',
  }}
  StatusIndicatorComponent={SystemStatusIndicator}
  links={[
    { label: 'Privacy', href: '/privacy' },
    { label: 'Terms', href: '/terms' },
  ]}
  onTrack={handleAnalytics}
  sticky
/>
```

#### AppFooterForHomePage (Full)
Full footer for home/landing pages with link sections.

```tsx
import { AppFooterForHomePage } from '@sudobility/building_blocks';

<AppFooterForHomePage
  logo={{ appName: 'My App' }}
  linkSections={[
    {
      title: 'Product',
      links: [
        { label: 'Features', href: '/features' },
        { label: 'Pricing', href: '/pricing' },
      ],
    },
    {
      title: 'Company',
      links: [
        { label: 'About', href: '/about' },
        { label: 'Contact', href: '/contact' },
      ],
    },
  ]}
  socialLinks={{
    twitterUrl: 'https://twitter.com/myapp',
    discordUrl: 'https://discord.gg/myapp',
  }}
  version="1.0.0"
  companyName="Sudobility Inc."
  description="Building the future of web3 communication"
  onTrack={handleAnalytics}
/>
```

### Layout

#### AppPageLayout
Layout wrapper combining TopBar, Breadcrumbs, Content, and Footer.

```tsx
import { AppPageLayout, AppTopBarWithFirebaseAuth, AppFooter } from '@sudobility/building_blocks';

<AppPageLayout
  topBar={<AppTopBarWithFirebaseAuth {...topBarProps} />}
  breadcrumbs={{
    items: breadcrumbItems,
    shareConfig: shareConfig,
  }}
  footer={<AppFooter {...footerProps} />}
  maxWidth="7xl"
  background="default"
>
  <h1>Page Content</h1>
</AppPageLayout>
```

### Settings Components

#### GlobalSettingsPage
Master-detail settings page with extensible sections.

```tsx
import { GlobalSettingsPage } from '@sudobility/building_blocks';

<GlobalSettingsPage
  theme={theme}
  fontSize={fontSize}
  onThemeChange={setTheme}
  onFontSizeChange={setFontSize}
  additionalSections={[
    {
      id: 'notifications',
      icon: BellIcon,
      label: 'Notifications',
      description: 'Manage notification preferences',
      content: <NotificationSettings />,
    },
  ]}
  onTrack={handleAnalytics}
/>
```

### Subscription Components

#### AppPricingPage
Public pricing page for displaying subscription options.

```tsx
import { AppPricingPage } from '@sudobility/building_blocks';

<AppPricingPage
  products={subscriptionProducts}
  isAuthenticated={isLoggedIn}
  hasActiveSubscription={hasSubscription}
  currentProductIdentifier={currentPlan}
  labels={pricingLabels}
  formatters={pricingFormatters}
  entitlementMap={packageToEntitlement}
  entitlementLevels={entitlementHierarchy}
  onPlanClick={(planId) => handlePlanSelection(planId)}
  onFreePlanClick={() => navigate('/signup')}
  onTrack={handleAnalytics}
/>
```

### Page Components

#### AppTextPage
Markdown/HTML content page for static content.

```tsx
import { AppTextPage } from '@sudobility/building_blocks';

<AppTextPage
  title="Privacy Policy"
  content={markdownContent}
  lastUpdated="2024-01-01"
/>
```

#### AppSitemapPage
SEO-friendly sitemap page.

```tsx
import { AppSitemapPage } from '@sudobility/building_blocks';

<AppSitemapPage
  sections={sitemapSections}
  LinkComponent={LocalizedLink}
/>
```

## Analytics Tracking

All major components support optional analytics tracking via the `onTrack` callback:

```tsx
import type { AnalyticsTrackingParams } from '@sudobility/building_blocks';

const handleAnalytics = (params: AnalyticsTrackingParams) => {
  // params.eventType: 'button_click' | 'link_click' | 'settings_change' | 'subscription_action'
  // params.componentName: 'AppFooter' | 'GlobalSettingsPage' | 'AppPricingPage'
  // params.label: 'footer_link_clicked' | 'theme_changed' | 'plan_clicked'
  // params.params: { link_href, theme, plan_identifier, ... }

  analytics.track(params.label, {
    component: params.componentName,
    ...params.params,
  });
};

<AppFooter onTrack={handleAnalytics} {...props} />
<GlobalSettingsPage onTrack={handleAnalytics} {...props} />
<AppPricingPage onTrack={handleAnalytics} {...props} />
```

**Components with analytics support:**
- `AppFooter` - tracks link clicks
- `AppFooterForHomePage` - tracks link clicks with section info
- `GlobalSettingsPage` - tracks theme/font changes, section navigation
- `AppPricingPage` - tracks plan clicks, billing period changes

## Constants

### Default Languages
16 languages with flags are included by default:

```tsx
import { DEFAULT_LANGUAGES } from '@sudobility/building_blocks';
// ['en', 'ar', 'de', 'es', 'fr', 'it', 'ja', 'ko', 'pt', 'ru', 'sv', 'th', 'uk', 'vi', 'zh', 'zh-hant']
```

## TypeScript Types

All props interfaces and utility types are exported:

```tsx
import type {
  // Component Props
  AppTopBarProps,
  AppFooterProps,
  AppFooterForHomePageProps,
  GlobalSettingsPageProps,
  AppPricingPageProps,

  // Configuration Types
  MenuItemConfig,
  LogoConfig,
  FooterLinkSection,
  SocialLinksConfig,
  StatusIndicatorConfig,
  ShareConfig,

  // Analytics
  AnalyticsTrackingParams,
  AnalyticsEventType,

  // Layout
  MaxWidth,
  ContentPadding,
  BackgroundVariant,
} from '@sudobility/building_blocks';
```

## Features

- **Responsive**: All components support mobile with hamburger menu
- **Dark Mode**: Full dark mode support via Tailwind CSS
- **i18n Ready**: Language selector with 16 default languages
- **Flexible Auth**: Support for Firebase auth or wallet connection
- **Analytics Ready**: Optional tracking callbacks for all user interactions
- **Customizable**: All components accept custom classNames and Link components
- **Tree-shakeable**: ESM only, optimized for modern bundlers

## License

MIT
