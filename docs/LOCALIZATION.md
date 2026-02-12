# Localization Guide

This document explains how localization (i18n) works across the Sudobility app ecosystem and how to configure it in your app.

## Overview

Localization uses **i18next** with **URL path-based routing** (e.g., `/en/dashboard`, `/zh/pricing`). Each app configures its own i18n instance and passes it to `SudobilityApp`, which provides the React context. The URL path is the source of truth for the current language.

### Key Libraries

| Library | Purpose |
|---------|---------|
| `i18next` | Core internationalization framework |
| `react-i18next` | React bindings (`useTranslation`, `I18nextProvider`) |
| `i18next-http-backend` | Loads translation JSON files from `/public/locales/` |
| `i18next-browser-languagedetector` | Detects user language from URL, localStorage, browser |

---

## Architecture

The localization pipeline flows through these layers:

```
App i18n.ts        → Configures i18next with supported languages, namespaces, detection
SudobilityApp      → Wraps app tree with I18nextProvider (i18n prop is REQUIRED)
LanguageRedirect   → Detects language on root visit, redirects / → /{lang}
LanguageValidator  → Validates /:lang param, syncs i18n state, renders child routes
useDocumentLanguage → Syncs <html lang="..." dir="..."> attributes
Translation files  → JSON files loaded from /public/locales/{lang}/{namespace}.json
```

### Data Flow

```
User visits /
  → LanguageRedirect detects language (localStorage > browser > default)
  → Navigates to /{lang}

User visits /{lang}/page
  → LanguageValidator validates lang param against SUPPORTED_LANGUAGES
  → If invalid: redirects to /en/page
  → If valid: calls i18n.changeLanguage(lang), persists to localStorage
  → useDocumentLanguage sets <html lang="fr" dir="ltr">
  → Components call useTranslation() to get translated strings
  → i18next loads /locales/{lang}/{namespace}.json via HTTP backend

User switches language via UI
  → switchLanguage('fr') called
  → i18n.changeLanguage('fr')
  → URL changes: /en/dashboard → /fr/dashboard
  → localStorage updated: language = 'fr'
  → Document attributes updated
  → Components re-render with new translations
```

---

## How to Configure Localization in Your App

### Step 1: Define Supported Languages

In `src/config/constants.ts`:

```tsx
export const SUPPORTED_LANGUAGES = [
  'en', 'ar', 'de', 'es', 'fr', 'it', 'ja', 'ko',
  'pt', 'ru', 'sv', 'th', 'uk', 'vi', 'zh', 'zh-hant',
] as const;

export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export const isLanguageSupported = (
  lang: string,
): lang is SupportedLanguage => {
  return SUPPORTED_LANGUAGES.includes(lang as SupportedLanguage);
};
```

### Step 2: Create i18n Configuration

In `src/i18n.ts`:

```tsx
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';
import { SUPPORTED_LANGUAGES, isLanguageSupported } from './config/constants';

const detectLanguageFromPath = (): string => {
  if (typeof window === 'undefined') return 'en';

  // URL path takes priority: /zh/page → 'zh'
  const pathLang = window.location.pathname.split('/')[1];
  if (pathLang && isLanguageSupported(pathLang)) {
    return pathLang;
  }

  // Fall back to saved preference
  try {
    const stored = localStorage.getItem('language');
    if (stored && isLanguageSupported(stored)) return stored;
  } catch {}

  return 'en';
};

let initialized = false;

export function initializeI18n(): void {
  if (initialized) return;
  initialized = true;

  i18n
    .use(Backend)
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      lng: detectLanguageFromPath(),
      fallbackLng: {
        zh: ['zh', 'en'],
        'zh-hant': ['zh-hant', 'zh', 'en'],
        default: ['en'],
      },
      initImmediate: false,
      supportedLngs: [...SUPPORTED_LANGUAGES],
      debug: false,

      interpolation: { escapeValue: false },

      backend: {
        loadPath: '/locales/{{lng}}/{{ns}}.json',
      },

      detection: {
        order: ['path', 'localStorage', 'navigator'],
        caches: ['localStorage'],
        lookupLocalStorage: 'language',
        lookupFromPathIndex: 0,
      },

      load: 'currentOnly',
      lowerCaseLng: true,
      nonExplicitSupportedLngs: false,

      defaultNS: 'common',
      ns: ['common', 'home', 'pricing', 'docs', 'dashboard', 'auth', 'settings'],
    });
}

export default i18n;
```

Key options explained:

| Option | Value | Why |
|--------|-------|-----|
| `load: 'currentOnly'` | Only loads the exact language code | Keeps `zh` and `zh-hant` separate (doesn't merge `zh-Hant` into `zh`) |
| `lowerCaseLng: true` | Normalizes `zh-Hant` → `zh-hant` | Consistent lowercase language codes in URLs |
| `nonExplicitSupportedLngs: false` | Only accepts languages in `supportedLngs` | Prevents i18next from accepting unlisted variants |
| `initImmediate: false` | Async initialization | Doesn't block initial render |
| `lookupFromPathIndex: 0` | Reads language from first URL segment | `/en/dashboard` → detects `en` |

### Step 3: Pass i18n to SudobilityApp

In `src/App.tsx`:

```tsx
import i18n from './i18n';
import { SudobilityAppWithFirebaseAuth } from '@sudobility/building_blocks/firebase';

function App() {
  return (
    <SudobilityAppWithFirebaseAuth
      i18n={i18n}          // REQUIRED - must pass your app's i18n instance
      baseUrl={CONSTANTS.API_URL}
      AuthProviderWrapper={AuthProviderWrapper}
    >
      <AppRoutes />
    </SudobilityAppWithFirebaseAuth>
  );
}
```

The `i18n` prop is **required** on all SudobilityApp variants:
- `SudobilityApp`
- `SudobilityAppWithFirebaseAuth`
- `SudobilityAppWithFirebaseAuthAndEntities`

### Step 4: Set Up Routes with Language Prefix

```tsx
import { LanguageValidator } from '@sudobility/components';
import { isLanguageSupported } from './config/constants';

function AppRoutes() {
  return (
    <Routes>
      {/* Root: detect language and redirect */}
      <Route path="/" element={<LanguageRedirect />} />

      {/* All routes nested under /:lang */}
      <Route
        path="/:lang"
        element={
          <LanguageValidator
            isLanguageSupported={isLanguageSupported}
            defaultLanguage="en"
            storageKey="language"
          />
        }
      >
        <Route index element={<HomePage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="pricing" element={<PricingPage />} />
        <Route path="dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        {/* ... */}
        <Route path="*" element={<Navigate to="." replace />} />
      </Route>

      {/* Catch-all: redirect to language detection */}
      <Route path="*" element={<LanguageRedirect />} />
    </Routes>
  );
}
```

`LanguageValidator` does three things:
1. Validates the `:lang` URL param against `isLanguageSupported()`
2. Calls `i18n.changeLanguage(lang)` to sync state with URL
3. Persists the choice to `localStorage`
4. Renders `<Outlet />` for child routes (or redirects if invalid)

### Step 5: Create LanguageRedirect Component

This component handles the root `/` path — it detects the user's preferred language and redirects:

```tsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { isLanguageSupported } from '../config/constants';

export default function LanguageRedirect() {
  const navigate = useNavigate();

  useEffect(() => {
    const lang = detectLanguage();
    navigate(`/${lang}`, { replace: true });
  }, [navigate]);

  return null;
}

function detectLanguage(): string {
  // 1. Check localStorage for saved preference
  try {
    const stored = localStorage.getItem('language');
    if (stored && isLanguageSupported(stored)) return stored;
  } catch {}

  // 2. Check browser language
  const browserLang = navigator.language.toLowerCase().split('-')[0];
  if (isLanguageSupported(browserLang)) return browserLang;

  // 3. Handle Chinese variants
  if (navigator.language.startsWith('zh')) {
    if (navigator.language.includes('TW') || navigator.language.includes('HK')) {
      return 'zh-hant';
    }
    return 'zh';
  }

  return 'en';
}
```

### Step 6: Sync Document Language (SEO & Accessibility)

Create `src/hooks/useDocumentLanguage.ts`:

```tsx
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const RTL_LANGUAGES = ['ar', 'he', 'fa', 'ur'];

export function useDocumentLanguage() {
  const { i18n } = useTranslation();

  useEffect(() => {
    const lang = i18n.language || 'en';
    const isRTL = RTL_LANGUAGES.includes(lang);

    document.documentElement.lang = lang;
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.dataset.lang = lang;
  }, [i18n.language]);
}
```

Wrap your route tree with it:

```tsx
function DocumentLanguageSync({ children }: { children: ReactNode }) {
  useDocumentLanguage();
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <DocumentLanguageSync>
      <Routes>{/* ... */}</Routes>
    </DocumentLanguageSync>
  );
}
```

### Step 7: Add Translation Files

Create JSON files under `public/locales/`:

```
public/locales/
├── en/
│   ├── common.json       # Shared strings (nav, buttons, etc.)
│   ├── home.json         # Home page strings
│   ├── dashboard.json    # Dashboard strings
│   └── auth.json         # Auth strings
├── fr/
│   ├── common.json
│   ├── home.json
│   └── ...
├── zh/
│   └── ...
└── zh-hant/
    └── ...
```

Example `public/locales/en/common.json`:

```json
{
  "nav": {
    "home": "Home",
    "pricing": "Pricing",
    "docs": "Documentation",
    "dashboard": "Dashboard",
    "settings": "Settings"
  },
  "actions": {
    "save": "Save",
    "cancel": "Cancel",
    "delete": "Delete"
  }
}
```

### Step 8: Use Translations in Components

```tsx
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();          // uses 'common' namespace by default
  const { t: tDocs } = useTranslation('docs');  // specific namespace

  return (
    <div>
      <h1>{t('nav.home')}</h1>
      <p>{tDocs('gettingStarted.title')}</p>
      <button>{t('actions.save')}</button>
    </div>
  );
}
```

### Step 9: Language-Aware Navigation

Use `useLocalizedNavigate` for programmatic navigation and `LocalizedLink` for links. Both automatically prepend the current language prefix.

```tsx
import { useLocalizedNavigate } from './hooks/useLocalizedNavigate';

function MyComponent() {
  const { navigate, switchLanguage, currentLanguage } = useLocalizedNavigate();

  // Navigate preserves language prefix
  navigate('/dashboard');        // → /en/dashboard (if current lang is 'en')

  // Switch language navigates to same page in new language
  switchLanguage('fr');          // /en/dashboard → /fr/dashboard
}
```

For the TopBar language selector:

```tsx
function TopBar() {
  const { switchLanguage, currentLanguage } = useLocalizedNavigate();

  const handleLanguageChange = (newLang: string) => {
    if (isLanguageSupported(newLang)) {
      switchLanguage(newLang);
    }
  };

  return (
    <AppTopBar
      currentLanguage={currentLanguage}
      onLanguageChange={handleLanguageChange}
      // ...
    />
  );
}
```

---

## Troubleshooting

### Language doesn't change when visiting /{lang} URL

**Cause**: The app is not passing its `i18n` instance to `SudobilityApp`.

Without the `i18n` prop, `I18nextProvider` is initialized with a default i18n that only supports English. The `LanguageValidator` calls `i18n.changeLanguage('zh')`, but the i18n instance doesn't have Chinese configured, so it falls back to English.

**Fix**: Always pass `i18n={i18n}` where `i18n` is your app's configured instance:

```tsx
import i18n from './i18n';

<SudobilityApp i18n={i18n}>
  {/* ... */}
</SudobilityApp>
```

This is a **required** prop — TypeScript will catch the error at compile time.

### Language selector changes URL but UI stays in English

**Cause**: Same as above — the i18n instance used by `useTranslation()` is not the one your app configured.

**Diagnosis**: Open browser DevTools console and run:

```js
// Check what languages the active i18n instance supports
document.querySelector('[data-lang]')?.dataset.lang  // Should show current lang
```

If translations aren't loading, check the Network tab for 404s on `/locales/{lang}/{ns}.json`.

### Translations show keys instead of translated text (e.g., "nav.home")

**Possible causes**:

1. **Translation file missing or 404**: Check Network tab for failed requests to `/locales/{lang}/{namespace}.json`
2. **Namespace not listed in `ns` array**: Make sure the namespace is included in the i18n `init()` config
3. **Wrong namespace in component**: `useTranslation('docs')` loads from `docs.json`, not `common.json`
4. **JSON syntax error**: Validate the translation JSON file

### Chinese Traditional (zh-hant) falls back to Simplified (zh)

This is intentional via the fallback chain:

```tsx
fallbackLng: {
  'zh-hant': ['zh-hant', 'zh', 'en'],  // tries zh-hant, then zh, then en
}
```

If you don't want fallback to Simplified, change to:

```tsx
'zh-hant': ['zh-hant', 'en'],
```

### RTL languages (Arabic, Hebrew) don't render right-to-left

**Fix**: Make sure `useDocumentLanguage()` is called at the top of your route tree. It sets `<html dir="rtl">` which Tailwind and CSS use for directional layouts.

```tsx
function AppRoutes() {
  return (
    <DocumentLanguageSync>   {/* ← Must wrap routes */}
      <Routes>{/* ... */}</Routes>
    </DocumentLanguageSync>
  );
}
```

### New language added but not recognized in URLs

Checklist when adding a new language:

1. Add the code to `SUPPORTED_LANGUAGES` in `src/config/constants.ts`
2. Create translation files in `public/locales/{lang}/` for each namespace
3. If the language has a fallback chain (like Chinese variants), add it to `fallbackLng` in `src/i18n.ts`
4. If the language is RTL, add it to the `RTL_LANGUAGES` array in `useDocumentLanguage`

### localStorage throws in Safari private browsing

All localStorage access should be wrapped in try-catch:

```tsx
try {
  localStorage.setItem('language', lang);
} catch {
  // Safari private browsing - preference won't persist
}
```

This is already handled in `LanguageValidator` and `LanguageRedirect`.

### App shows flash of wrong language on page load

The initial language is detected synchronously from the URL path before React renders:

```tsx
lng: detectLanguageFromPath(),  // Reads from window.location.pathname
```

If you see a flash, ensure:
1. `detectLanguageFromPath()` is called in `i18n.init()` (not async)
2. `initImmediate: false` is set (prevents async initialization race)
3. The `i18n` module is imported before React renders (top of `App.tsx`)

---

## Summary

| Concern | Where to Configure |
|---------|-------------------|
| Supported languages | `src/config/constants.ts` — `SUPPORTED_LANGUAGES` |
| i18n initialization | `src/i18n.ts` — plugins, detection, namespaces |
| Provider setup | `src/App.tsx` — pass `i18n={i18n}` to `SudobilityApp` |
| Route structure | `src/App.tsx` — `LanguageRedirect` at `/`, `LanguageValidator` at `/:lang` |
| Translation files | `public/locales/{lang}/{namespace}.json` |
| Document attributes | `src/hooks/useDocumentLanguage.ts` — `<html lang>` and `dir` |
| Language switching | TopBar — `useLocalizedNavigate().switchLanguage()` |
| In-component usage | `useTranslation()` — `t('key')` for translated strings |
