import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AppPageLayout } from '../components/layout/app-page-layout';
import React from 'react';

// Mock the LayoutProvider from @sudobility/components
vi.mock('@sudobility/components', () => ({
  LayoutProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid='layout-provider'>{children}</div>
  ),
}));

// Mock the AppBreadcrumbs component
vi.mock('../components/breadcrumbs/app-breadcrumbs', () => ({
  AppBreadcrumbs: ({ items }: { items: Array<{ label: string }> }) => (
    <nav data-testid='breadcrumbs'>
      {items.map((item, i) => (
        <span key={i}>{item.label}</span>
      ))}
    </nav>
  ),
}));

describe('AppPageLayout', () => {
  const mockTopBar = <div data-testid='topbar'>TopBar</div>;
  const mockFooter = <div data-testid='footer'>Footer</div>;

  it('renders children content', () => {
    render(
      <AppPageLayout topBar={mockTopBar}>
        <div>Page Content</div>
      </AppPageLayout>
    );

    expect(screen.getByText('Page Content')).toBeInTheDocument();
  });

  it('renders topBar in header', () => {
    render(
      <AppPageLayout topBar={mockTopBar}>
        <div>Content</div>
      </AppPageLayout>
    );

    expect(screen.getByTestId('topbar')).toBeInTheDocument();
  });

  it('renders footer when provided', () => {
    render(
      <AppPageLayout topBar={mockTopBar} footer={mockFooter}>
        <div>Content</div>
      </AppPageLayout>
    );

    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });

  it('does not render footer when not provided', () => {
    render(
      <AppPageLayout topBar={mockTopBar}>
        <div>Content</div>
      </AppPageLayout>
    );

    expect(screen.queryByTestId('footer')).not.toBeInTheDocument();
  });

  describe('breadcrumbs', () => {
    it('renders breadcrumbs when provided with items', () => {
      render(
        <AppPageLayout
          topBar={mockTopBar}
          breadcrumbs={{
            items: [
              { label: 'Home', href: '/' },
              { label: 'Page', current: true },
            ],
          }}
        >
          <div>Content</div>
        </AppPageLayout>
      );

      expect(screen.getByTestId('breadcrumbs')).toBeInTheDocument();
      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('Page')).toBeInTheDocument();
    });

    it('does not render breadcrumbs when items is empty', () => {
      render(
        <AppPageLayout topBar={mockTopBar} breadcrumbs={{ items: [] }}>
          <div>Content</div>
        </AppPageLayout>
      );

      expect(screen.queryByTestId('breadcrumbs')).not.toBeInTheDocument();
    });

    it('does not render breadcrumbs when not provided', () => {
      render(
        <AppPageLayout topBar={mockTopBar}>
          <div>Content</div>
        </AppPageLayout>
      );

      expect(screen.queryByTestId('breadcrumbs')).not.toBeInTheDocument();
    });
  });

  describe('max width', () => {
    it('applies max-w-7xl by default', () => {
      render(
        <AppPageLayout topBar={mockTopBar}>
          <div>Content</div>
        </AppPageLayout>
      );

      const main = screen.getByRole('main');
      expect(main.querySelector('.max-w-7xl')).toBeInTheDocument();
    });

    it('applies custom max width', () => {
      render(
        <AppPageLayout topBar={mockTopBar} maxWidth='4xl'>
          <div>Content</div>
        </AppPageLayout>
      );

      const main = screen.getByRole('main');
      expect(main.querySelector('.max-w-4xl')).toBeInTheDocument();
    });

    it('applies full width', () => {
      render(
        <AppPageLayout topBar={mockTopBar} maxWidth='full'>
          <div>Content</div>
        </AppPageLayout>
      );

      const main = screen.getByRole('main');
      expect(main.querySelector('.max-w-full')).toBeInTheDocument();
    });
  });

  describe('background variants', () => {
    it('applies default background', () => {
      const { container } = render(
        <AppPageLayout topBar={mockTopBar}>
          <div>Content</div>
        </AppPageLayout>
      );

      const layout = container.querySelector('.bg-gray-50');
      expect(layout).toBeInTheDocument();
    });

    it('applies white background', () => {
      const { container } = render(
        <AppPageLayout topBar={mockTopBar} background='white'>
          <div>Content</div>
        </AppPageLayout>
      );

      const layout = container.querySelector('.bg-white');
      expect(layout).toBeInTheDocument();
    });

    it('applies gradient background', () => {
      const { container } = render(
        <AppPageLayout topBar={mockTopBar} background='gradient'>
          <div>Content</div>
        </AppPageLayout>
      );

      const layout = container.querySelector('.bg-gradient-to-br');
      expect(layout).toBeInTheDocument();
    });
  });

  describe('custom classNames', () => {
    it('applies custom className to container', () => {
      const { container } = render(
        <AppPageLayout topBar={mockTopBar} className='custom-container'>
          <div>Content</div>
        </AppPageLayout>
      );

      expect(container.querySelector('.custom-container')).toBeInTheDocument();
    });

    it('applies custom contentClassName', () => {
      render(
        <AppPageLayout topBar={mockTopBar} contentClassName='custom-content'>
          <div>Content</div>
        </AppPageLayout>
      );

      const main = screen.getByRole('main');
      expect(main.querySelector('.custom-content')).toBeInTheDocument();
    });

    it('applies custom mainClassName', () => {
      render(
        <AppPageLayout topBar={mockTopBar} mainClassName='custom-main'>
          <div>Content</div>
        </AppPageLayout>
      );

      expect(screen.getByRole('main')).toHaveClass('custom-main');
    });
  });

  describe('content padding', () => {
    it('applies md padding by default', () => {
      render(
        <AppPageLayout topBar={mockTopBar}>
          <div>Content</div>
        </AppPageLayout>
      );

      const main = screen.getByRole('main');
      expect(main.querySelector('.py-8')).toBeInTheDocument();
    });

    it('applies sm padding', () => {
      render(
        <AppPageLayout topBar={mockTopBar} contentPadding='sm'>
          <div>Content</div>
        </AppPageLayout>
      );

      const main = screen.getByRole('main');
      expect(main.querySelector('.py-6')).toBeInTheDocument();
    });

    it('applies lg padding', () => {
      render(
        <AppPageLayout topBar={mockTopBar} contentPadding='lg'>
          <div>Content</div>
        </AppPageLayout>
      );

      const main = screen.getByRole('main');
      expect(main.querySelector('.py-12')).toBeInTheDocument();
    });
  });

  it('wraps content in LayoutProvider', () => {
    render(
      <AppPageLayout topBar={mockTopBar}>
        <div>Content</div>
      </AppPageLayout>
    );

    expect(screen.getByTestId('layout-provider')).toBeInTheDocument();
  });
});
