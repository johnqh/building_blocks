import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  AppPageLayout,
  type TopBarConfig,
  type FooterConfig,
} from '../components/layout/app-page-layout';
import React from 'react';

// Mock the LayoutProvider from @sudobility/components
vi.mock('@sudobility/components', () => ({
  LayoutProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid='layout-provider'>{children}</div>
  ),
  AspectFitView: ({
    children,
    aspectRatio,
  }: {
    children: React.ReactNode;
    aspectRatio: number;
  }) => (
    <div data-testid='aspect-fit-view' data-aspect-ratio={aspectRatio}>
      {children}
    </div>
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

// Mock all TopBar components
vi.mock('../components/topbar/app-topbar', () => ({
  AppTopBar: (props: Record<string, unknown>) => (
    <div data-testid='app-topbar' data-variant={props.variant}>
      AppTopBar
    </div>
  ),
}));

vi.mock('../components/topbar/app-topbar-with-firebase-auth', () => ({
  AppTopBarWithFirebaseAuth: (props: Record<string, unknown>) => (
    <div data-testid='app-topbar-firebase' data-variant={props.variant}>
      AppTopBarWithFirebaseAuth
    </div>
  ),
}));

vi.mock('../components/topbar/app-topbar-with-wallet', () => ({
  AppTopBarWithWallet: (props: Record<string, unknown>) => (
    <div data-testid='app-topbar-wallet' data-variant={props.variant}>
      AppTopBarWithWallet
    </div>
  ),
}));

// Mock all Footer components
vi.mock('../components/footer/app-footer', () => ({
  AppFooter: (props: Record<string, unknown>) => (
    <div data-testid='app-footer'>{String(props.companyName)}</div>
  ),
}));

vi.mock('../components/footer/app-footer-for-home-page', () => ({
  AppFooterForHomePage: (props: Record<string, unknown>) => (
    <div data-testid='app-footer-home'>{String(props.companyName)}</div>
  ),
}));

describe('AppPageLayout', () => {
  const baseTopBar: TopBarConfig = {
    variant: 'base',
    logo: { src: '/logo.png', appName: 'Test' },
    menuItems: [],
  };

  const compactFooter: FooterConfig = {
    variant: 'compact',
    companyName: 'Test Co',
  };

  const fullFooter: FooterConfig = {
    variant: 'full',
    logo: { appName: 'Test' },
    linkSections: [],
    companyName: 'Test Co',
  };

  it('renders children content', () => {
    render(
      <AppPageLayout topBar={baseTopBar}>
        <div>Page Content</div>
      </AppPageLayout>
    );

    expect(screen.getByText('Page Content')).toBeInTheDocument();
  });

  it('renders topBar in header', () => {
    render(
      <AppPageLayout topBar={baseTopBar}>
        <div>Content</div>
      </AppPageLayout>
    );

    expect(screen.getByTestId('app-topbar')).toBeInTheDocument();
  });

  it('renders footer when provided', () => {
    render(
      <AppPageLayout topBar={baseTopBar} footer={compactFooter}>
        <div>Content</div>
      </AppPageLayout>
    );

    expect(screen.getByTestId('app-footer')).toBeInTheDocument();
  });

  it('does not render footer when not provided', () => {
    render(
      <AppPageLayout topBar={baseTopBar}>
        <div>Content</div>
      </AppPageLayout>
    );

    expect(screen.queryByTestId('app-footer')).not.toBeInTheDocument();
    expect(screen.queryByTestId('app-footer-home')).not.toBeInTheDocument();
  });

  describe('breadcrumbs', () => {
    it('renders breadcrumbs when provided with items', () => {
      render(
        <AppPageLayout
          topBar={baseTopBar}
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
        <AppPageLayout topBar={baseTopBar} breadcrumbs={{ items: [] }}>
          <div>Content</div>
        </AppPageLayout>
      );

      expect(screen.queryByTestId('breadcrumbs')).not.toBeInTheDocument();
    });

    it('does not render breadcrumbs when not provided', () => {
      render(
        <AppPageLayout topBar={baseTopBar}>
          <div>Content</div>
        </AppPageLayout>
      );

      expect(screen.queryByTestId('breadcrumbs')).not.toBeInTheDocument();
    });
  });

  describe('max width', () => {
    it('applies max-w-7xl by default', () => {
      render(
        <AppPageLayout topBar={baseTopBar}>
          <div>Content</div>
        </AppPageLayout>
      );

      const main = screen.getByRole('main');
      expect(main.querySelector('.max-w-7xl')).toBeInTheDocument();
    });

    it('applies custom max width', () => {
      render(
        <AppPageLayout topBar={baseTopBar} maxWidth='4xl'>
          <div>Content</div>
        </AppPageLayout>
      );

      const main = screen.getByRole('main');
      expect(main.querySelector('.max-w-4xl')).toBeInTheDocument();
    });

    it('applies full width', () => {
      render(
        <AppPageLayout topBar={baseTopBar} maxWidth='full'>
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
        <AppPageLayout topBar={baseTopBar}>
          <div>Content</div>
        </AppPageLayout>
      );

      const layout = container.querySelector('.bg-gray-50');
      expect(layout).toBeInTheDocument();
    });

    it('applies white background', () => {
      const { container } = render(
        <AppPageLayout topBar={baseTopBar} background='white'>
          <div>Content</div>
        </AppPageLayout>
      );

      const layout = container.querySelector('.bg-white');
      expect(layout).toBeInTheDocument();
    });

    it('applies gradient background', () => {
      const { container } = render(
        <AppPageLayout topBar={baseTopBar} background='gradient'>
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
        <AppPageLayout topBar={baseTopBar} className='custom-container'>
          <div>Content</div>
        </AppPageLayout>
      );

      expect(container.querySelector('.custom-container')).toBeInTheDocument();
    });

    it('applies custom contentClassName', () => {
      render(
        <AppPageLayout topBar={baseTopBar} contentClassName='custom-content'>
          <div>Content</div>
        </AppPageLayout>
      );

      const main = screen.getByRole('main');
      expect(main.querySelector('.custom-content')).toBeInTheDocument();
    });

    it('applies custom mainClassName', () => {
      render(
        <AppPageLayout topBar={baseTopBar} mainClassName='custom-main'>
          <div>Content</div>
        </AppPageLayout>
      );

      expect(screen.getByRole('main')).toHaveClass('custom-main');
    });
  });

  describe('content padding', () => {
    it('applies md padding by default', () => {
      render(
        <AppPageLayout topBar={baseTopBar}>
          <div>Content</div>
        </AppPageLayout>
      );

      const main = screen.getByRole('main');
      expect(main.querySelector('.py-8')).toBeInTheDocument();
    });

    it('applies sm padding', () => {
      render(
        <AppPageLayout topBar={baseTopBar} contentPadding='sm'>
          <div>Content</div>
        </AppPageLayout>
      );

      const main = screen.getByRole('main');
      expect(main.querySelector('.py-6')).toBeInTheDocument();
    });

    it('applies lg padding', () => {
      render(
        <AppPageLayout topBar={baseTopBar} contentPadding='lg'>
          <div>Content</div>
        </AppPageLayout>
      );

      const main = screen.getByRole('main');
      expect(main.querySelector('.py-12')).toBeInTheDocument();
    });
  });

  it('wraps content in LayoutProvider', () => {
    render(
      <AppPageLayout topBar={baseTopBar}>
        <div>Content</div>
      </AppPageLayout>
    );

    expect(screen.getByTestId('layout-provider')).toBeInTheDocument();
  });

  describe('topBar variant switching', () => {
    it('renders AppTopBar for variant "base"', () => {
      render(
        <AppPageLayout topBar={baseTopBar}>
          <div>Content</div>
        </AppPageLayout>
      );

      expect(screen.getByTestId('app-topbar')).toBeInTheDocument();
      expect(screen.getByText('AppTopBar')).toBeInTheDocument();
    });

    it('renders AppTopBarWithFirebaseAuth for variant "firebase"', () => {
      const MockAuth = () => <div>Auth</div>;
      const firebaseTopBar: TopBarConfig = {
        variant: 'firebase',
        logo: { src: '/logo.png', appName: 'Test' },
        menuItems: [],
        AuthActionComponent: MockAuth,
      };

      render(
        <AppPageLayout topBar={firebaseTopBar}>
          <div>Content</div>
        </AppPageLayout>
      );

      expect(screen.getByTestId('app-topbar-firebase')).toBeInTheDocument();
      expect(screen.getByText('AppTopBarWithFirebaseAuth')).toBeInTheDocument();
    });

    it('renders AppTopBarWithWallet for variant "wallet"', () => {
      const walletTopBar: TopBarConfig = {
        variant: 'wallet',
        logo: { src: '/logo.png', appName: 'Test' },
        menuItems: [],
        isConnected: false,
        onConnect: vi.fn(),
        onDisconnect: vi.fn(),
      };

      render(
        <AppPageLayout topBar={walletTopBar}>
          <div>Content</div>
        </AppPageLayout>
      );

      expect(screen.getByTestId('app-topbar-wallet')).toBeInTheDocument();
      expect(screen.getByText('AppTopBarWithWallet')).toBeInTheDocument();
    });
  });

  describe('footer variant switching', () => {
    it('renders AppFooter for variant "compact"', () => {
      render(
        <AppPageLayout topBar={baseTopBar} footer={compactFooter}>
          <div>Content</div>
        </AppPageLayout>
      );

      expect(screen.getByTestId('app-footer')).toBeInTheDocument();
    });

    it('renders AppFooterForHomePage for variant "full"', () => {
      render(
        <AppPageLayout topBar={baseTopBar} footer={fullFooter}>
          <div>Content</div>
        </AppPageLayout>
      );

      expect(screen.getByTestId('app-footer-home')).toBeInTheDocument();
    });
  });

  describe('sticky footer behavior', () => {
    it('applies sticky classes for compact footer', () => {
      const { container } = render(
        <AppPageLayout topBar={baseTopBar} footer={compactFooter}>
          <div>Content</div>
        </AppPageLayout>
      );

      const footer = container.querySelector('footer');
      expect(footer).toHaveClass('sticky', 'bottom-0', 'z-10');
    });

    it('does not apply sticky classes for full footer', () => {
      const { container } = render(
        <AppPageLayout topBar={baseTopBar} footer={fullFooter}>
          <div>Content</div>
        </AppPageLayout>
      );

      const footer = container.querySelector('footer');
      expect(footer).not.toHaveClass('sticky');
    });
  });

  describe('prop pass-through', () => {
    it('passes topBarVariant as variant to the underlying topbar component', () => {
      const topBar: TopBarConfig = {
        variant: 'base',
        topBarVariant: 'app',
        logo: { src: '/logo.png', appName: 'Test' },
        menuItems: [],
      };

      render(
        <AppPageLayout topBar={topBar}>
          <div>Content</div>
        </AppPageLayout>
      );

      expect(screen.getByTestId('app-topbar')).toHaveAttribute(
        'data-variant',
        'app'
      );
    });

    it('passes companyName to compact footer', () => {
      render(
        <AppPageLayout topBar={baseTopBar} footer={compactFooter}>
          <div>Content</div>
        </AppPageLayout>
      );

      expect(screen.getByText('Test Co')).toBeInTheDocument();
    });

    it('passes companyName to full footer', () => {
      render(
        <AppPageLayout topBar={baseTopBar} footer={fullFooter}>
          <div>Content</div>
        </AppPageLayout>
      );

      expect(screen.getByText('Test Co')).toBeInTheDocument();
    });
  });
});
