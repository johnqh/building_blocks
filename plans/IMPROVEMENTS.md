# Improvement Plans for @sudobility/building_blocks

## Priority 1 - High Impact

### 1. Expand Test Coverage
- **Current state**: 6 test files covering topbar, footer, breadcrumbs, layout, language selector, and languages constants
- **Gap**: No tests for subscription components (AppPricingPage, AppSubscriptionsPage, LazySubscriptionProvider), settings components (AppearanceSettings, GlobalSettingsPage), page components (LoginPage, AppTextPage, AppSitemapPage), API context (ApiProvider, useApi), or app wrappers (SudobilityApp, SudobilityAppWithFirebaseAuth, SudobilityAppWithFirebaseAuthAndEntities)
- **Recommendation**: Add tests for subscription components first (highest user-facing risk), then settings, then page components. Use mocked providers for integration tests of app wrappers.
- **Effort**: Medium-high

### 2. Decouple LoginPage from firebase/auth
- **Current state**: `login-page.tsx` directly imports `signInWithEmailAndPassword`, `createUserWithEmailAndPassword`, `GoogleAuthProvider`, `signInWithPopup` from `firebase/auth`, yet it is exported from the **main** entry point (not `/firebase`)
- **Impact**: Consumers who import LoginPage must have firebase installed even if they only want the UI shell
- **Recommendation**: Either move LoginPage to the `/firebase` entry point, or refactor to accept auth handler callbacks (`onEmailSignIn`, `onGoogleSignIn`) as props instead of importing firebase directly
- **Effort**: Medium

### 3. Fix Dynamic Tailwind Class Construction in LoginPage
- **Current state**: LoginPage uses string interpolation for Tailwind classes (`text-${primaryColorClass}-600`, `focus:ring-${primaryColorClass}-500`) which breaks Tailwind's JIT purging -- these classes will not be included in production builds unless safelisted
- **Recommendation**: Replace with a mapping object or `cva` variants that produce complete, static class strings
- **Effort**: Low

## Priority 2 - Medium Impact

### 4. Remove Code Duplication in Footer Components
- **Current state**: `app-footer.tsx` and `app-footer-for-home-page.tsx` both independently define `DefaultLinkComponent` and `getCopyrightYear()`
- **Recommendation**: Extract into a shared `footer/shared.ts` module
- **Effort**: Low

### 5. Consolidate File Naming Conventions
- **Current state**: Mixed kebab-case (`app-footer.tsx`, `app-topbar.tsx`) and PascalCase (`AppPricingPage.tsx`, `AppSubscriptionsPage.tsx`, `LazySubscriptionProvider.tsx`) for component files
- **Recommendation**: Standardize on kebab-case (the majority convention) or document that PascalCase is reserved for subscription components
- **Effort**: Low (documentation) to Medium (rename files)

### 6. Add Accessibility (a11y) Improvements
- **Current state**: Some components have ARIA labels (LanguageSelector has `aria-label`, `aria-expanded`, `aria-haspopup`, `role="listbox"`) but others (breadcrumbs share dropdown, footer links) lack keyboard navigation support
- **Recommendation**: Audit all interactive components for keyboard navigation, focus management, and ARIA attributes. AppBreadcrumbs' ShareDropdown is fully mouse-driven with no keyboard support.
- **Effort**: Medium

### 7. Type-safe i18n Keys
- **Current state**: Translation keys are plain strings (`t('key', fallback)`) with no compile-time validation. `AppearanceSettingsTranslations` and `GlobalSettingsPageTranslations` interfaces exist but are not enforced at the call site.
- **Recommendation**: Create a typed i18n wrapper or use branded string types to catch missing translations at build time
- **Effort**: Medium

## Priority 3 - Architecture

### 8. Consider Additional Entry Points
- **Current state**: Two entry points (main and `/firebase`) with 12 optional peer dependencies
- **Recommendation**: Consider splitting into `./subscription` (for AppPricingPage, AppSubscriptionsPage, LazySubscriptionProvider) and `./web3` (for AppTopBarWithWallet) to reduce import-time dependency requirements
- **Effort**: High

### 9. Add Development-Only Warnings
- **Current state**: `SudobilityAppWithFirebaseAuthAndEntities` logs a `console.warn` when entityApiUrl is missing; other misconfiguration scenarios fail silently
- **Recommendation**: Add development-only warnings (gated by `process.env.NODE_ENV`) for common misconfiguration: missing providers, mismatched prop types, missing required optional peers
- **Effort**: Low

## Priority 4 - Developer Experience

### 10. Add Storybook or Playground
- **Current state**: No visual development environment; developers must test components in consuming apps
- **Recommendation**: Add a minimal Vite-based dev playground or Storybook that renders all components with mock data
- **Effort**: Medium

### 11. Add @example JSDoc to Remaining Components
- **Current state**: AppPricingPage, AppSubscriptionsPage, app wrappers, and footer components have `@example` blocks; AppBreadcrumbs, AppearanceSettings, LanguageSelector, and AppPageLayout variants do not
- **Recommendation**: Add @example JSDoc blocks showing minimal usage to all exported components
- **Effort**: Low

## Priority 5 - Performance

### 12. Lazy-load Subscription Page Components
- **Current state**: LazySubscriptionProvider lazy-loads the RevenueCat SDK (~600KB), but AppPricingPage and AppSubscriptionsPage themselves are bundled in the main entry
- **Recommendation**: Consider making subscription page components lazy-loadable via `React.lazy()` wrappers
- **Effort**: Medium

### 13. Audit Barrel File Tree-shaking
- **Current state**: Multiple levels of barrel `index.ts` re-exports (component dir -> components/index.ts -> src/index.ts)
- **Recommendation**: Verify tree-shaking with a bundle analyzer. Consider adding `sideEffects: false` to package.json if not already present.
- **Effort**: Low
