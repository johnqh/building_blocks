# @sudobility/building_blocks

Higher-level shared UI building blocks for Sudobility apps. These components integrate with authentication, wallet connection, i18n, and routing.

## Installation

```bash
bun add @sudobility/building_blocks
```

## Peer Dependencies

Required:
- `@sudobility/components`
- `@sudobility/design`
- `@heroicons/react`
- `react` (^18.0.0 || ^19.0.0)
- `class-variance-authority`
- `clsx`
- `tailwind-merge`

Optional (for specific features):
- `@sudobility/auth-components` - For Firebase auth integration
- `@sudobility/web3-components` - For wallet connection
- `@sudobility/devops-components` - For status indicator

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

## Constants

### Default Languages
16 languages with flags are included by default:

```tsx
import { DEFAULT_LANGUAGES } from '@sudobility/building_blocks';
// ['en', 'ar', 'de', 'es', 'fr', 'it', 'ja', 'ko', 'pt', 'ru', 'sv', 'th', 'uk', 'vi', 'zh', 'zh-hant']
```

## Features

- **Responsive**: All components support mobile with hamburger menu
- **Dark Mode**: Full dark mode support via Tailwind CSS
- **i18n Ready**: Language selector with 16 default languages
- **Flexible Auth**: Support for Firebase auth or wallet connection
- **Customizable**: All components accept custom classNames and Link components

## License

MIT
