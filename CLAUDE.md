# CLAUDE.md - AI Assistant Guide

This file provides guidance for AI assistants working with this repository.

## Project Overview

`@sudobility/building_blocks` is a React component library providing higher-level, reusable UI building blocks for Sudobility applications. It builds on top of `@sudobility/components` and `@sudobility/design` to provide complete, production-ready UI sections.

**Package**: `@sudobility/building_blocks`
**Type**: React component library (ESM)
**Framework**: React 18/19, TypeScript, Vite

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
bun run build

# Development mode with watch
bun run dev

# Type checking
bun run typecheck

# Linting
bun run lint
bun run lint:fix

# Formatting
bun run format
bun run format:check

# Testing
bun run test           # Run tests once
bun run test:watch     # Watch mode
bun run test:ui        # Vitest UI
```

## Project Structure

```
src/
├── components/           # UI building block components
│   ├── breadcrumbs/     # App breadcrumb navigation
│   ├── footer/          # App footer component
│   ├── layout/          # Page layout components
│   ├── topbar/          # App top navigation bar
│   └── index.ts         # Component exports
├── constants/           # Shared constants
│   └── languages.ts     # Language/locale definitions
├── utils/               # Utility functions
├── types.ts             # TypeScript type definitions
├── index.ts             # Main entry point
└── __tests__/           # Test files
```

## Key Components

### AppTopbar
Top navigation bar with logo, navigation links, and actions.

### AppFooter
Footer with company info, links, and language selector.

### AppPageLayout
Standard page layout wrapper with header and footer.

### AppBreadcrumbs
Breadcrumb navigation component.

### LanguageSelector
Internationalization language picker component.

## Dependencies

### Peer Dependencies (required by consuming apps)
- `@sudobility/components` - Base UI components
- `@sudobility/design` - Design tokens and styling
- `react`, `react-dom` - React 18 or 19
- `@heroicons/react` - Icon library
- `class-variance-authority`, `clsx`, `tailwind-merge` - Styling utilities

## Code Style

- **TypeScript**: Strict mode enabled
- **Styling**: Tailwind CSS via design system
- **Components**: Functional components with TypeScript interfaces
- **Testing**: Vitest with React Testing Library
- **Formatting**: Prettier

## Testing Guidelines

Tests are located in `src/__tests__/`. Each component should have corresponding tests covering:
- Rendering with default props
- Prop variations
- User interactions
- Accessibility

```bash
# Run specific test file
bun run test src/__tests__/app-footer.test.tsx
```

## Adding New Components

1. Create component directory in `src/components/`
2. Add component file with TypeScript interface
3. Export from `src/components/index.ts`
4. Add to main `src/index.ts` exports
5. Add tests in `src/__tests__/`
6. Run `bun run typecheck && bun run lint && bun run test`

## Build Output

- `dist/index.js` - ES module bundle
- `dist/index.d.ts` - TypeScript declarations

The library is tree-shakeable and optimized for modern bundlers.
