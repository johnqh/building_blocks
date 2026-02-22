# building_blocks - AI Development Guide

## Overview

`@sudobility/building_blocks` is a React component library providing higher-level, reusable UI building blocks for Sudobility applications. It builds on top of `@sudobility/components` and `@sudobility/design` to deliver production-ready app shells, navigation bars, footers, settings pages, subscription/pricing screens, and full app wrappers with Firebase auth, entity management, and i18n support.

- **Package**: `@sudobility/building_blocks`
- **Version**: 0.0.127
- **License**: BUSL-1.1
- **Package Manager**: Bun (always use `bun` instead of `npm`)
- **Framework**: React 18/19, TypeScript 5.9+, Vite 6.x
- **Build**: ESM-only library via Vite lib mode + tsc declarations
- **Testing**: Vitest with React Testing Library

## Project Structure

```
src/
├── index.ts                        # Main entry point (core exports, no auth dependency)
├── firebase.ts                     # Secondary entry: Firebase-auth-dependent exports
├── types.ts                        # All shared TypeScript type definitions
├── vite-env.d.ts                   # Vite env type declarations (VITE_API_URL, etc.)
├── components/
│   ├── index.ts                    # Re-exports all component subdirectories
│   ├── app/                        # App wrapper components (provider stacks)
│   │   ├── SudobilityApp.tsx                              # Base app shell (i18n, theme, query, routing, toast)
│   │   ├── SudobilityAppWithFirebaseAuth.tsx               # + Firebase auth + ApiProvider
│   │   ├── SudobilityAppWithFirebaseAuthAndEntities.tsx    # + entity client + subscription
│   │   └── index.ts
│   ├── api/                        # API context (Firebase token management)
│   │   ├── ApiContext.tsx           # ApiProvider, useApi, useApiSafe hooks
│   │   └── index.ts
│   ├── topbar/                     # Top navigation bar variants
│   │   ├── app-topbar.tsx                       # Base topbar with logo, nav, language selector
│   │   ├── app-topbar-with-firebase-auth.tsx    # + Firebase auth action button
│   │   ├── app-topbar-with-wallet.tsx           # + Web3 wallet connection
│   │   ├── language-selector.tsx                # i18n language picker (compact/full variants)
│   │   └── index.ts
│   ├── breadcrumbs/                # Breadcrumb navigation
│   │   ├── app-breadcrumbs.tsx     # Breadcrumbs + social share + "Talk to Founder" button
│   │   └── index.ts
│   ├── footer/                     # Footer components
│   │   ├── app-footer.tsx                    # Compact footer (version, copyright, status, links)
│   │   ├── app-footer-for-home-page.tsx      # Full footer (link grid, brand, social, status)
│   │   └── index.ts
│   ├── layout/                     # Page layout wrapper
│   │   ├── app-page-layout.tsx     # Combines topbar + breadcrumbs + content + footer
│   │   └── index.ts
│   ├── settings/                   # Settings components
│   │   ├── appearance-settings.tsx     # Theme (light/dark/system) + font size selector
│   │   ├── global-settings-page.tsx    # Master-detail settings page (extensible sections)
│   │   └── index.ts
│   ├── subscription/               # Subscription/pricing components
│   │   ├── AppPricingPage.tsx                 # Public pricing page (uses subscription_lib hooks)
│   │   ├── AppSubscriptionsPage.tsx           # Authenticated subscription management page
│   │   ├── SafeSubscriptionContext.tsx        # Safe context with stub values for unauthenticated
│   │   ├── LazySubscriptionProvider.tsx       # Lazy-loads RevenueCat SDK (~600KB) on auth
│   │   ├── SubscriptionProviderWrapper.tsx    # Bridges subscription-components with auth/entity
│   │   └── index.ts
│   └── pages/                      # Full page components
│       ├── app-text-page.tsx       # Markdown/text content page (privacy, terms, etc.)
│       ├── app-sitemap-page.tsx    # Sitemap page with language selector + link grid
│       ├── login-page.tsx          # Email/password + Google sign-in page
│       └── index.ts
├── constants/
│   ├── languages.ts                # 16 default languages with flags, RTL detection
│   └── index.ts
├── utils/
│   └── index.ts                    # cn() utility (clsx + tailwind-merge)
├── i18n/
│   └── index.ts                    # initializeI18n(), getI18n(), i18n instance
├── test/
│   └── setup.ts                    # Vitest setup (@testing-library/jest-dom)
└── __tests__/                      # Test files
    ├── app-breadcrumbs.test.tsx
    ├── app-footer.test.tsx
    ├── app-page-layout.test.tsx
    ├── app-topbar.test.tsx
    ├── language-selector.test.tsx
    └── languages.test.ts
```

## Key Components

### App Wrappers (Provider Stacks)

| Component | Description | Provides |
|-----------|-------------|----------|
| `SudobilityApp` | Base app shell | HelmetProvider, I18nextProvider, ThemeProvider, NetworkProvider, QueryClientProvider, ToastProvider, BrowserRouter, InfoBanner, PageTracker |
| `SudobilityAppWithFirebaseAuth` | + Firebase auth | All of above + AuthProvider, ApiProvider (Firebase ID token management) |
| `SudobilityAppWithFirebaseAuthAndEntities` | + entities + subscriptions | All of above + CurrentEntityProvider, LazySubscriptionProvider |

Import the Firebase-dependent wrappers from `@sudobility/building_blocks/firebase`.

### TopBar Components

| Component | Description | Use Case |
|-----------|-------------|----------|
| `AppTopBar` | Base navigation bar with logo, nav items, language selector | Custom auth rendering via `renderAccountSection` |
| `AppTopBarWithFirebaseAuth` | TopBar + Firebase AuthAction component | Apps using Firebase authentication |
| `AppTopBarWithWallet` | TopBar + wallet connect/dropdown | Web3 apps with wallet auth (EVM/Solana) |
| `LanguageSelector` | i18n language picker dropdown | Two variants: `compact` (topbar) and `full` (settings) |

### Footer Components

| Component | Description | Use Case |
|-----------|-------------|----------|
| `AppFooter` | Compact sticky footer | App pages - version, copyright, status indicator, links |
| `AppFooterForHomePage` | Full footer with grid | Landing pages - link sections, brand, social links, status |

### Layout Components

| Component | Description | Use Case |
|-----------|-------------|----------|
| `AppPageLayout` | Full page wrapper | Combines topbar + breadcrumbs + content + footer with configurable maxWidth, padding, background |
| `AppBreadcrumbs` | Breadcrumb navigation | Page hierarchy with social share dropdown and "Talk to Founder" button |

### Settings Components

| Component | Description | Use Case |
|-----------|-------------|----------|
| `GlobalSettingsPage` | Master-detail settings layout | Appearance built-in as first section, extensible via `additionalSections` |
| `AppearanceSettings` | Theme and font size selects | Standalone or embedded in GlobalSettingsPage |

### Subscription Components

| Component | Description | Use Case |
|-----------|-------------|----------|
| `AppPricingPage` | Public pricing display | Marketing pricing page (authenticated and unauthenticated states) |
| `AppSubscriptionsPage` | User subscription management | Authenticated users - current plan, upgrade, restore purchases |
| `LazySubscriptionProvider` | Lazy-loads RevenueCat SDK | Defers ~600KB SDK load until user authenticates |
| `SafeSubscriptionContext` | Stub subscription context | Provides safe defaults for unauthenticated users |

### Page Components

| Component | Description | Use Case |
|-----------|-------------|----------|
| `AppTextPage` | Structured text content page | Privacy policy, terms of service, docs (content/list/subsection types) |
| `AppSitemapPage` | Sitemap display with categories | SEO sitemap with language selector and quick links |
| `LoginPage` | Email/password + Google sign-in | Firebase auth login page with error handling |

### API Context

| Export | Description | Use Case |
|--------|-------------|----------|
| `ApiProvider` | Manages Firebase ID token and network client | Provides `useApi()` hook with token, userId, networkClient |
| `useApi()` | Access API context (throws if outside provider) | Authenticated API requests |
| `useApiSafe()` | Access API context (returns null if outside provider) | Optional API access |

## Development Commands

```bash
# Install dependencies
bun install

# Build the library (Vite + tsc declarations)
bun run build

# Development mode with watch
bun run dev

# Type checking
bun run typecheck        # or: bun run type-check

# Linting
bun run lint             # ESLint with max-warnings 0
bun run lint:fix         # Auto-fix ESLint issues

# Formatting
bun run format           # Format with Prettier
bun run format:check     # Check formatting

# Testing
bun run test             # Run tests once
bun run test:watch       # Watch mode
bun run test:ui          # Vitest UI

# Clean build artifacts
bun run clean

# Full verification
bun run typecheck && bun run lint && bun run test
```

## Architecture / Patterns

### Dual Entry Points

The library has two entry points to manage dependency trees:

- **`@sudobility/building_blocks`** (main): Core components with no hard dependency on auth-components, auth_lib, di, or entity_client. Safe to import in any context.
- **`@sudobility/building_blocks/firebase`**: Firebase-auth-dependent exports (SudobilityAppWithFirebaseAuth, SudobilityAppWithFirebaseAuthAndEntities, ApiProvider, LazySubscriptionProvider, SubscriptionProviderWrapper). These require `@sudobility/auth-components` and related packages.

### Component Injection Pattern

Components avoid hard dependencies on optional packages by accepting components as props:

```typescript
// TopBar accepts AuthAction or WalletDropdownMenu as a prop
<AppTopBarWithFirebaseAuth AuthActionComponent={AuthAction} ... />
<AppTopBarWithWallet WalletDropdownMenuComponent={WalletDropdownMenu} ... />

// Footer accepts SystemStatusIndicator as a prop
<AppFooter StatusIndicatorComponent={SystemStatusIndicator} ... />
```

### Styling

- **Tailwind CSS** via `@sudobility/design` system tokens
- **`cn()` utility** (clsx + tailwind-merge) for conditional class merging
- **Dark mode** via `dark:` Tailwind variants throughout all components
- **Theme tokens**: `text-theme-*`, `bg-theme-*` classes for theming
- **class-variance-authority** (`cva`) for variant-driven styling (layout backgrounds, breadcrumb variants)
- **`@sudobility/design`** provides `GRADIENT_CLASSES` and `textVariants`

### Internationalization (i18n)

- Uses **i18next** + **react-i18next** + **i18next-http-backend** + **i18next-browser-languagedetector**
- 16 default languages (with RTL support for Arabic)
- Language detection order: URL path, localStorage, navigator
- Translation namespaces: common, home, pricing, docs, dashboard, auth, privacy, terms, settings
- Components accept `t` function props for translatable labels (e.g., `AppearanceSettings`, `GlobalSettingsPage`)

### Analytics Tracking

All major interactive components support optional analytics via an `onTrack` callback:

```typescript
onTrack?: (params: AnalyticsTrackingParams) => void;

interface AnalyticsTrackingParams {
  eventType: 'button_click' | 'link_click' | 'navigation' | 'settings_change' | 'subscription_action' | 'page_view';
  componentName: string;
  label: string;
  params?: Record<string, unknown>;
}
```

Components with analytics: `AppPricingPage`, `AppSubscriptionsPage`, `GlobalSettingsPage`, `AppFooter`, `AppFooterForHomePage`.

### Provider Composition (App Wrappers)

The `SudobilityApp*` wrappers compose providers in this order (outermost to innermost):

```
HelmetProvider > I18nextProvider > ThemeProvider > NetworkProvider > QueryClientProvider > ToastProvider > [AppProviders] > BrowserRouter > [PageTracker + Suspense + ToastContainer + InfoBanner]
```

`SudobilityAppWithFirebaseAuth` adds: `AuthProvider > ApiProvider` inside AppProviders.
`SudobilityAppWithFirebaseAuthAndEntities` adds: `AuthAwareEntityProvider > EntityAwareSubscriptionProvider` inside AppProviders.

### TypeScript

- **Strict mode** enabled with `noUnusedLocals`, `noUnusedParameters`
- **Path alias**: `@/*` maps to `./src/*`
- **Props naming**: `{ComponentName}Props` (e.g., `AppTopBarProps`)
- **Structural typing**: `QueryClientLike` and `I18nLike` used in app wrappers to avoid cross-package type conflicts with bun link
- All types centralized in `src/types.ts` and re-exported from main entry

### File Naming Conventions

- Components: `kebab-case.tsx` (e.g., `app-footer.tsx`) or `PascalCase.tsx` for subscription components
- Tests: `{component-name}.test.tsx` in `src/__tests__/`
- Index files: barrel re-exports for all public APIs
- Each component directory has its own `index.ts`

## Common Tasks

### Add a new component

1. Create directory: `src/components/{component-name}/`
2. Create component file with Props interface (JSDoc + `@ai-context` tags)
3. Create `index.ts` that re-exports component and types
4. Update `src/components/index.ts` to include new directory
5. If it should be in the main entry, update `src/index.ts`
6. Add tests in `src/__tests__/{component-name}.test.tsx`
7. Verify: `bun run typecheck && bun run lint && bun run test`

### Add analytics tracking to a component

1. Import: `import type { AnalyticsTrackingParams } from '../../types';`
2. Add prop: `onTrack?: (params: AnalyticsTrackingParams) => void;`
3. Create track helper with `useCallback`:
   ```typescript
   const track = useCallback((label: string, params?: Record<string, unknown>) => {
     onTrack?.({ eventType: 'button_click', componentName: 'MyComponent', label, params });
   }, [onTrack]);
   ```
4. Call `track()` on user interactions

### Add a new settings section to GlobalSettingsPage

Pass `additionalSections` prop with `SettingsSectionConfig` objects:
```typescript
<GlobalSettingsPage
  additionalSections={[{
    id: 'notifications',
    icon: BellIcon,
    label: 'Notifications',
    description: 'Manage notification preferences',
    content: <NotificationSettings />,
  }]}
  ...
/>
```

### Add a new language

Edit `src/constants/languages.ts` and add to `DEFAULT_LANGUAGES` array. If the language is RTL, add its code to `RTL_LANGUAGES`.

### Add a new app wrapper variant

Extend `SudobilityAppWithFirebaseAuth` or `SudobilityAppWithFirebaseAuthAndEntities` and compose additional providers via the `AppProviders` prop pattern.

## Build Output

```
dist/
├── index.js        # Main ESM bundle (core components)
├── index.js.map    # Source map
├── index.d.ts      # TypeScript declarations
├── firebase.js     # Firebase entry bundle (auth-dependent components)
├── firebase.js.map # Source map
└── firebase.d.ts   # TypeScript declarations
```

The library is tree-shakeable (ESM only), not minified, with source maps enabled. All `@sudobility/*`, `react`, `firebase`, and other peer dependencies are externalized.

## Peer / Key Dependencies

### Required Peer Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `react` / `react-dom` | ^18.0.0 or ^19.0.0 | UI framework |
| `@sudobility/components` | ^5.0.11 | Base UI components (Topbar, Footer, Section, Select, MasterDetailLayout, etc.) |
| `@sudobility/design` | ^1.1.18 | Design tokens, GRADIENT_CLASSES, textVariants |
| `@heroicons/react` | ^2.0.0 | Icon library |
| `@tanstack/react-query` | ^5.0.0 | Data fetching / caching |
| `class-variance-authority` | ^0.7.0 | Variant-driven styling |
| `clsx` | ^2.0.0 | Conditional classnames |
| `tailwind-merge` | ^2.0.0 or ^3.0.0 | Tailwind class deduplication |
| `i18next` | ^23.0.0 - ^25.0.0 | Internationalization core |
| `react-i18next` | ^14.0.0 - ^16.0.0 | React i18n bindings |
| `react-helmet-async` | ^2.0.0 | Head/SEO management |
| `react-router-dom` | ^6.0.0 or ^7.0.0 | Client-side routing |

### Optional Peer Dependencies (Feature-Specific)

| Package | Required For |
|---------|-------------|
| `firebase` (^11 or ^12) | `LoginPage`, Firebase auth features |
| `@sudobility/auth-components` | `AppTopBarWithFirebaseAuth`, Firebase app wrappers, `LazySubscriptionProvider` |
| `@sudobility/auth_lib` | Firebase app wrappers, `ApiProvider` |
| `@sudobility/web3-components` | `AppTopBarWithWallet` |
| `@sudobility/devops-components` | `SystemStatusIndicator` in footers, `NetworkProvider` in app wrappers |
| `@sudobility/subscription-components` | `AppPricingPage`, `AppSubscriptionsPage`, subscription providers |
| `@sudobility/subscription_lib` | Subscription hooks (useSubscriptionPeriods, useUserSubscription, etc.) |
| `@sudobility/entity_client` | `SudobilityAppWithFirebaseAuthAndEntities` |
| `@sudobility/di` / `@sudobility/di_web` | Service locator for InfoBanner, Firebase services |
| `@sudobility/types` | Shared TypeScript enums (Theme, FontSize, InfoType, RateLimitsConfigData) |
| `i18next-browser-languagedetector` | Auto language detection in `initializeI18n` |
| `i18next-http-backend` | Loading translation files via HTTP in `initializeI18n` |

## Testing Guidelines

Tests live in `src/__tests__/`. Run with `bun run test`.

```bash
bun run test                                  # All tests
bun run test src/__tests__/app-footer         # Specific file
bun run test -- --coverage                    # With coverage
```

Test patterns:
- Render with required props, assert visible text
- Test prop variations (optional props, conditional rendering)
- Test user interactions via `@testing-library/user-event`
- Mock external components passed as props (e.g., `AuthActionComponent`)

## Environment Variables

| Variable | Used By | Purpose |
|----------|---------|---------|
| `VITE_API_URL` | `ApiProvider`, `SudobilityAppWithFirebaseAuthAndEntities` | Base API URL |
| `VITE_REVENUECAT_API_KEY` | `SudobilityAppWithFirebaseAuthAndEntities` | RevenueCat production API key |
| `VITE_REVENUECAT_API_KEY_SANDBOX` | `SudobilityAppWithFirebaseAuthAndEntities` | RevenueCat sandbox API key |

## Troubleshooting

**"Cannot find module '@sudobility/components'"** -- Ensure peer dependencies are installed in the consuming app. Check that versions match peer dependency requirements.

**"useApi must be used within an ApiProvider"** -- Wrap your component tree with `ApiProvider` or use one of the Firebase app wrappers that include it. Use `useApiSafe()` for optional access.

**Tests failing after changes** -- Run `bun run typecheck` first to catch type errors. Check if test mocks need updating for new props.

**Import errors from `@sudobility/building_blocks/firebase`** -- Ensure `@sudobility/auth-components`, `@sudobility/auth_lib`, and `@sudobility/di` are installed. These are optional peer dependencies required only for the `/firebase` entry point.
