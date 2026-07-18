import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { configureTheme, themes } from '@sudobility/design/themes';
import { AppBreadcrumbs } from '../components/breadcrumbs/app-breadcrumbs';

// Reproduces the app bootstrap order: modules (and any module-level class
// strings) are evaluated on import, and configureTheme() only runs afterwards.
// The rendered background must still resolve to semantic theme classes.

const testItems = [
  { label: 'Home', href: '/' },
  { label: 'Widget', current: true },
];

describe('AppBreadcrumbs theming', () => {
  it('default variant uses semantic theme background when a theme is configured after import', () => {
    configureTheme(themes.cyberpunk);
    const { container } = render(<AppBreadcrumbs items={testItems} />);
    const root = container.firstChild as HTMLElement;
    expect(root.className).toContain('bg-card');
    expect(root.className).not.toContain('bg-white');
  });

  it('subtle variant uses semantic theme background when a theme is configured after import', () => {
    configureTheme(themes.cyberpunk);
    const { container } = render(
      <AppBreadcrumbs items={testItems} variant='subtle' />
    );
    const root = container.firstChild as HTMLElement;
    expect(root.className).toContain('bg-muted');
    expect(root.className).not.toContain('bg-gray-50');
  });
});
