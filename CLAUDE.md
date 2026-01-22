# CLAUDE.md - AI Assistant Guide

This file provides comprehensive guidance for AI assistants (Claude Code, GitHub Copilot, Cursor, etc.) when working with this repository. It contains essential context, patterns, and instructions to enable effective AI-assisted development.

## Project Overview

`@sudobility/building_blocks` is a React component library providing higher-level, reusable UI building blocks for Sudobility applications. It builds on top of `@sudobility/components` and `@sudobility/design` to provide complete, production-ready UI sections.

**Package**: `@sudobility/building_blocks`
**Version**: 0.0.21+
**Type**: React component library (ESM only)
**Framework**: React 18/19, TypeScript 5.9+, Vite 6.x
**Testing**: Vitest with React Testing Library

## Package Manager

**This project uses Bun as the package manager.** Always use `bun` commands instead of `npm`:

```bash
# Install dependencies
bun install

# Run scripts
bun run build
bun run test
bun run lint
```

## Development Commands

```bash
# Build the library
bun run build          # Builds to dist/ with TypeScript declarations

# Development mode with watch
bun run dev            # Watches for changes and rebuilds

# Type checking
bun run typecheck      # Run tsc --noEmit

# Linting
bun run lint           # ESLint with max-warnings 0
bun run lint:fix       # Auto-fix ESLint issues

# Formatting
bun run format         # Format with Prettier
bun run format:check   # Check formatting

# Testing
bun run test           # Run tests once (85 tests across 6 files)
bun run test:watch     # Watch mode
bun run test:ui        # Vitest UI
```

## Project Structure

```
src/
├── components/                    # UI building block components
│   ├── breadcrumbs/              # Breadcrumb navigation
│   │   ├── app-breadcrumbs.tsx   # Main breadcrumbs component
│   │   └── index.ts
│   ├── footer/                   # Footer components
│   │   ├── app-footer.tsx        # Compact footer (for app pages)
│   │   ├── app-footer-for-home-page.tsx  # Full footer (for landing pages)
│   │   └── index.ts
│   ├── layout/                   # Page layout wrapper
│   │   ├── app-page-layout.tsx   # Combines topbar, breadcrumbs, content, footer
│   │   └── index.ts
│   ├── pages/                    # Full page components
│   │   ├── app-text-page.tsx     # Markdown/text content page
│   │   ├── app-sitemap-page.tsx  # Sitemap page
│   │   └── index.ts
│   ├── settings/                 # Settings components
│   │   ├── appearance-settings.tsx   # Theme/font size settings
│   │   ├── global-settings-page.tsx  # Full settings page with navigation
│   │   └── index.ts
│   ├── subscription/             # Subscription/pricing components
│   │   ├── AppPricingPage.tsx    # Public pricing page
│   │   ├── AppSubscriptionsPage.tsx  # User subscriptions management
│   │   └── index.ts
│   ├── topbar/                   # Top navigation bar variants
│   │   ├── app-topbar.tsx        # Base topbar
│   │   ├── app-topbar-with-firebase-auth.tsx  # With Firebase auth
│   │   ├── app-topbar-with-wallet.tsx  # With wallet connection
│   │   ├── language-selector.tsx # i18n language picker
│   │   └── index.ts
│   └── index.ts                  # All component exports
├── constants/                    # Shared constants
│   ├── languages.ts              # 16 supported languages with flags
│   └── index.ts
├── utils/                        # Utility functions
│   └── index.ts                  # cn() classname utility
├── i18n/                         # Internationalization utilities
│   └── index.ts                  # Translation helpers
├── firebase.ts                   # Firebase auth utilities
├── types.ts                      # All TypeScript type definitions
├── index.ts                      # Main entry point
├── vite-env.d.ts                 # Vite environment types
├── test/                         # Test setup
│   └── setup.ts                  # Vitest setup file
└── __tests__/                    # Test files (85 tests)
    ├── app-breadcrumbs.test.tsx
    ├── app-footer.test.tsx
    ├── app-page-layout.test.tsx
    ├── app-topbar.test.tsx
    ├── language-selector.test.tsx
    └── languages.test.ts
```

## Key Components

### TopBar Components

| Component | Description | Use Case |
|-----------|-------------|----------|
| `AppTopBar` | Base navigation bar | When you need custom auth rendering |
| `AppTopBarWithFirebaseAuth` | TopBar + Firebase auth | Apps using Firebase authentication |
| `AppTopBarWithWallet` | TopBar + wallet connection | Web3 apps with wallet auth |
| `LanguageSelector` | i18n language picker | Standalone language switching |

### Footer Components

| Component | Description | Use Case |
|-----------|-------------|----------|
| `AppFooter` | Compact footer with sticky positioning | App pages, dashboards |
| `AppFooterForHomePage` | Full footer with link sections | Landing pages, marketing pages |

### Layout Components

| Component | Description | Use Case |
|-----------|-------------|----------|
| `AppPageLayout` | Full page wrapper | Combines topbar, breadcrumbs, content, footer |
| `AppBreadcrumbs` | Breadcrumb navigation | Page hierarchy with share buttons |

### Settings Components

| Component | Description | Use Case |
|-----------|-------------|----------|
| `GlobalSettingsPage` | Master-detail settings layout | App settings with multiple sections |
| `AppearanceSettings` | Theme & font size controls | Embedded in settings pages |

### Subscription Components

| Component | Description | Use Case |
|-----------|-------------|----------|
| `AppPricingPage` | Public pricing display | Marketing pricing page |
| `AppSubscriptionsPage` | User subscription management | Authenticated subscription management |

### Page Components

| Component | Description | Use Case |
|-----------|-------------|----------|
| `AppTextPage` | Markdown/HTML content page | Privacy policy, terms, docs |
| `AppSitemapPage` | Sitemap display | SEO sitemap page |

## Analytics Tracking Integration

All major components support optional analytics tracking via the `onTrack` callback prop:

```typescript
import type { AnalyticsTrackingParams } from '@sudobility/building_blocks';

interface AnalyticsTrackingParams {
  eventType: 'button_click' | 'link_click' | 'navigation' | 'settings_change' | 'subscription_action' | 'page_view';
  componentName: string;
  label: string;
  params?: Record<string, unknown>;
}

// Usage
<AppPricingPage
  {...props}
  onTrack={(params) => {
    // params.eventType: 'subscription_action'
    // params.label: 'plan_clicked' | 'billing_period_changed' | 'free_plan_clicked'
    // params.params: { plan_identifier, action_type, ... }
    myAnalytics.track(params);
  }}
/>

<GlobalSettingsPage
  {...props}
  onTrack={(params) => {
    // params.eventType: 'settings_change'
    // params.label: 'theme_changed' | 'font_size_changed' | 'section_selected'
    myAnalytics.track(params);
  }}
/>

<AppFooter
  {...props}
  onTrack={(params) => {
    // params.eventType: 'link_click'
    // params.label: 'footer_link_clicked'
    // params.params: { link_label, link_href, section_title }
    myAnalytics.track(params);
  }}
/>
```

**Components with analytics support:**
- `AppPricingPage` - tracks plan clicks, billing period changes
- `GlobalSettingsPage` - tracks theme/font changes, section navigation
- `AppFooter` - tracks footer link clicks
- `AppFooterForHomePage` - tracks footer link clicks with section info

## Type Definitions (src/types.ts)

Key types exported from the package:

```typescript
// Navigation & Menu
interface MenuItemConfig { id, label, icon, href, show? }
interface LogoConfig { src?, alt?, appName, onClick? }
interface BreadcrumbItem { label, href?, current? }

// Footer
interface FooterLinkItem { label, href, onClick? }
interface FooterLinkSection { title, links: FooterLinkItem[] }
interface SocialLinksConfig { twitterUrl?, discordUrl?, linkedinUrl?, githubUrl?, redditUrl?, farcasterUrl?, telegramUrl? }
interface StatusIndicatorConfig { statusPageUrl, apiEndpoint?, refreshInterval? }

// Sharing
interface ShareConfig { title, description, hashtags, onBeforeShare? }
interface TalkToFounderConfig { meetingUrl, buttonText?, icon? }

// Layout
type MaxWidth = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl' | '7xl' | 'full'
type ContentPadding = 'none' | 'sm' | 'md' | 'lg'
type BackgroundVariant = 'default' | 'white' | 'gradient'

// Analytics
type AnalyticsEventType = 'button_click' | 'link_click' | 'navigation' | 'settings_change' | 'subscription_action' | 'page_view'
interface AnalyticsTrackingParams { eventType, componentName, label, params? }
interface AnalyticsTracker { onTrack: (params: AnalyticsTrackingParams) => void }

// Component Integration
interface LinkComponentProps { href, className?, children, onClick? }
```

## Dependencies Architecture

### Peer Dependencies (Required by consuming apps)

```
@sudobility/components  - Base UI components (Button, Card, etc.)
@sudobility/design      - Design tokens and Tailwind utilities
@heroicons/react        - Icon library
react, react-dom        - React 18 or 19
class-variance-authority - Variant styling
clsx, tailwind-merge    - Classname utilities
```

### Optional Peer Dependencies (For specific features)

```
@sudobility/auth-components        - For AppTopBarWithFirebaseAuth
@sudobility/web3-components        - For AppTopBarWithWallet
@sudobility/devops-components      - For SystemStatusIndicator in footers
@sudobility/subscription-components - For AppPricingPage, AppSubscriptionsPage
@sudobility/types                  - For Theme, FontSize enums
```

## Code Style & Conventions

### TypeScript
- Strict mode enabled
- All components have explicit prop interfaces
- Use `type` for object shapes, `interface` for extendable contracts
- Export types alongside components

### React Components
- Functional components only (no class components)
- Props interface named `{ComponentName}Props`
- Default exports with named export for the interface
- Use React.FC sparingly (prefer explicit return types)

### Styling
- Tailwind CSS via design system tokens
- Use `cn()` utility for conditional classes
- Dark mode via `dark:` Tailwind variants
- Theme colors via `text-theme-*`, `bg-theme-*` classes

### File Naming
- Components: `kebab-case.tsx` (e.g., `app-footer.tsx`)
- Tests: `{component-name}.test.tsx`
- Index files re-export all public APIs

## Testing Guidelines

Tests are in `src/__tests__/`. Current coverage: 85 tests across 6 test files.

### Test Patterns

```typescript
// Component rendering test
it('renders with required props', () => {
  render(<AppFooter companyName="Test" />);
  expect(screen.getByText('Test')).toBeInTheDocument();
});

// Prop variation test
it('shows version when provided', () => {
  render(<AppFooter companyName="Test" version="1.0.0" />);
  expect(screen.getByText('v1.0.0')).toBeInTheDocument();
});

// User interaction test
it('calls onClick when link clicked', async () => {
  const onClick = vi.fn();
  render(<AppFooter companyName="Test" links={[{ label: 'Link', href: '#', onClick }]} />);
  await userEvent.click(screen.getByText('Link'));
  expect(onClick).toHaveBeenCalled();
});
```

### Running Tests

```bash
bun run test                              # All tests
bun run test src/__tests__/app-footer     # Specific file
bun run test -- --coverage                # With coverage
```

## Adding New Components

1. **Create component directory**: `src/components/{component-name}/`
2. **Create component file**: `{component-name}.tsx` with:
   - Props interface with JSDoc comments
   - Functional component with explicit types
   - Default export
3. **Create index.ts**: Re-export component and types
4. **Update parent index.ts**: Add `export * from './{component-name}'`
5. **Add tests**: `src/__tests__/{component-name}.test.tsx`
6. **Verify**: `bun run typecheck && bun run lint && bun run test`

### Component Template

```tsx
import React from 'react';
import { cn } from '../../utils';
import type { AnalyticsTrackingParams } from '../../types';

/**
 * Props for MyComponent.
 *
 * @ai-context Reusable UI component for [purpose]
 * @ai-pattern Accepts onTrack for analytics integration
 */
export interface MyComponentProps {
  /** Primary content or label */
  children: React.ReactNode;
  /** Optional CSS class name */
  className?: string;
  /** Optional analytics tracking callback */
  onTrack?: (params: AnalyticsTrackingParams) => void;
}

/**
 * MyComponent - Brief description of what it does.
 *
 * @example
 * ```tsx
 * <MyComponent onTrack={handleTrack}>
 *   Content here
 * </MyComponent>
 * ```
 */
export const MyComponent: React.FC<MyComponentProps> = ({
  children,
  className,
  onTrack,
}) => {
  return (
    <div className={cn('base-classes', className)}>
      {children}
    </div>
  );
};

export default MyComponent;
```

## AI-Assisted Development Patterns

### When Adding Features

1. **Check existing patterns**: Look at similar components first
2. **Follow analytics pattern**: Add `onTrack` prop if component has user interactions
3. **Add comprehensive JSDoc**: Include `@ai-context`, `@example`, parameter descriptions
4. **Test all variations**: Cover required props, optional props, interactions

### When Fixing Bugs

1. **Read the component**: Understand current implementation
2. **Check tests**: Existing tests may reveal expected behavior
3. **Run type check first**: `bun run typecheck` catches many issues
4. **Verify fix**: `bun run test` should pass

### When Refactoring

1. **Run all checks before**: `bun run typecheck && bun run lint && bun run test`
2. **Make incremental changes**: Small commits are easier to verify
3. **Run all checks after**: Same command to verify nothing broke

## Common Tasks for AI Assistants

### Task: Add analytics tracking to a component

1. Import the type: `import type { AnalyticsTrackingParams } from '../../types';`
2. Add prop: `onTrack?: (params: AnalyticsTrackingParams) => void;`
3. Add prop to destructuring
4. Create track helper:
   ```typescript
   const track = useCallback((label: string, params?: Record<string, unknown>) => {
     onTrack?.({ eventType: 'button_click', componentName: 'MyComponent', label, params });
   }, [onTrack]);
   ```
5. Call `track()` on user interactions

### Task: Add a new prop to existing component

1. Add to Props interface with JSDoc comment
2. Add to component destructuring with default if optional
3. Use in component JSX
4. Add test case for the new prop
5. Update README.md examples if significant

### Task: Create a test for a component

1. Create file: `src/__tests__/{component-name}.test.tsx`
2. Import component, render, screen, userEvent
3. Write describe block with component name
4. Add tests for: rendering, prop variations, user interactions
5. Run: `bun run test src/__tests__/{component-name}`

## Build Output

```
dist/
├── index.js      # ES module bundle (~160KB, ~30KB gzipped)
├── index.js.map  # Source map
└── index.d.ts    # TypeScript declarations
```

The library is:
- Tree-shakeable (ESM only)
- Optimized for modern bundlers (Vite, esbuild, webpack 5+)
- Compatible with React 18 and 19

## Troubleshooting

### Common Issues

**"Cannot find module '@sudobility/components'"**
- Ensure peer dependencies are installed in consuming app
- Check that versions match peer dependency requirements

**"Type error: Property 'onTrack' does not exist"**
- Update to latest version of @sudobility/building_blocks
- The `onTrack` prop was added in version 0.0.21

**Tests failing after changes**
- Run `bun run typecheck` first to catch type errors
- Check if test mocks need updating for new props

**Lint errors about unused parameters**
- Use `_param` prefix for intentionally unused parameters
- Or add `// eslint-disable-next-line @typescript-eslint/no-unused-vars`
