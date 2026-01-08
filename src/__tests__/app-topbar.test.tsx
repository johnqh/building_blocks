import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AppTopBar } from '../components/topbar/app-topbar';
import React from 'react';
import { HomeIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

// Mock the Topbar components from @sudobility/components
vi.mock('@sudobility/components', () => ({
  Topbar: ({
    children,
    className,
    'aria-label': ariaLabel,
  }: {
    children: React.ReactNode;
    className?: string;
    'aria-label'?: string;
  }) => (
    <nav className={className} data-testid='topbar' aria-label={ariaLabel}>
      {children}
    </nav>
  ),
  TopbarProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid='topbar-provider'>{children}</div>
  ),
  TopbarLeft: ({ children }: { children: React.ReactNode }) => (
    <div data-testid='topbar-left'>{children}</div>
  ),
  TopbarRight: ({ children }: { children: React.ReactNode }) => (
    <div data-testid='topbar-right'>{children}</div>
  ),
  TopbarLogo: ({
    children,
    onClick,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
  }) => (
    <button data-testid='topbar-logo' onClick={onClick}>
      {children}
    </button>
  ),
  TopbarNavigation: ({
    children,
    items,
  }: {
    children: React.ReactNode;
    items: Array<{ id: string; label: string; href: string }>;
  }) => (
    <div data-testid='topbar-navigation'>
      {children}
      <ul>
        {items.map(item => (
          <li key={item.id}>
            <a href={item.href}>{item.label}</a>
          </li>
        ))}
      </ul>
    </div>
  ),
  TopbarActions: ({ children }: { children: React.ReactNode }) => (
    <div data-testid='topbar-actions'>{children}</div>
  ),
  Logo: ({
    logoSrc,
    logoText,
    logoAlt,
    showText,
  }: {
    size?: string;
    logoSrc?: string;
    logoText?: string;
    logoAlt?: string;
    showText?: boolean;
  }) => (
    <div data-testid='logo'>
      {logoSrc && <img src={logoSrc} alt={logoAlt || logoText} />}
      {showText && logoText && <span>{logoText}</span>}
    </div>
  ),
}));

// Mock the LanguageSelector
vi.mock('../components/topbar/language-selector', () => ({
  LanguageSelector: ({
    currentLanguage,
    onLanguageChange,
  }: {
    currentLanguage?: string;
    onLanguageChange?: (code: string) => void;
  }) => (
    <button
      data-testid='language-selector'
      onClick={() => onLanguageChange?.('es')}
    >
      {currentLanguage || 'en'}
    </button>
  ),
}));

const defaultProps = {
  logo: {
    src: '/logo.png',
    appName: 'Test App',
    alt: 'Test App Logo',
  },
  menuItems: [
    { id: 'home', label: 'Home', href: '/', icon: HomeIcon },
    {
      id: 'about',
      label: 'About',
      href: '/about',
      icon: InformationCircleIcon,
    },
  ],
};

describe('AppTopBar', () => {
  it('renders topbar with logo', () => {
    render(<AppTopBar {...defaultProps} />);

    expect(screen.getByTestId('topbar')).toBeInTheDocument();
    expect(screen.getByTestId('topbar-logo')).toBeInTheDocument();
    expect(screen.getByText('Test App')).toBeInTheDocument();
  });

  it('renders logo image', () => {
    render(<AppTopBar {...defaultProps} />);

    const img = screen.getByAltText('Test App Logo');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', '/logo.png');
  });

  it('renders navigation items', () => {
    render(<AppTopBar {...defaultProps} />);

    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('About')).toBeInTheDocument();
  });

  it('filters out hidden menu items', () => {
    const propsWithHidden = {
      ...defaultProps,
      menuItems: [
        { id: 'home', label: 'Home', href: '/', icon: HomeIcon, show: true },
        {
          id: 'hidden',
          label: 'Hidden',
          href: '/hidden',
          icon: HomeIcon,
          show: false,
        },
        { id: 'about', label: 'About', href: '/about', icon: HomeIcon },
      ],
    };

    render(<AppTopBar {...propsWithHidden} />);

    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('About')).toBeInTheDocument();
    expect(screen.queryByText('Hidden')).not.toBeInTheDocument();
  });

  describe('language selector', () => {
    it('shows language selector by default', () => {
      render(<AppTopBar {...defaultProps} />);

      expect(screen.getByTestId('language-selector')).toBeInTheDocument();
    });

    it('hides language selector when hideLanguageSelector is true', () => {
      render(<AppTopBar {...defaultProps} hideLanguageSelector />);

      expect(screen.queryByTestId('language-selector')).not.toBeInTheDocument();
    });

    it('passes current language to selector', () => {
      render(<AppTopBar {...defaultProps} currentLanguage='fr' />);

      expect(screen.getByTestId('language-selector')).toHaveTextContent('fr');
    });
  });

  describe('account section', () => {
    it('renders account section when provided', () => {
      render(
        <AppTopBar
          {...defaultProps}
          renderAccountSection={() => <button>Login</button>}
        />
      );

      expect(screen.getByText('Login')).toBeInTheDocument();
    });

    it('does not render account section when not provided', () => {
      render(<AppTopBar {...defaultProps} />);

      expect(screen.queryByText('Login')).not.toBeInTheDocument();
    });
  });

  describe('custom className', () => {
    it('applies custom className', () => {
      render(<AppTopBar {...defaultProps} className='custom-topbar' />);

      expect(screen.getByTestId('topbar')).toHaveClass('custom-topbar');
    });
  });

  describe('custom LinkComponent', () => {
    it('uses custom LinkComponent for navigation', () => {
      const CustomLink = ({
        href,
        children,
      }: {
        href: string;
        children: React.ReactNode;
      }) => (
        <a href={href} data-custom='true'>
          {children}
        </a>
      );

      // The LinkComponent is passed to TopbarNavigation
      // Since we're mocking, we just verify the component renders
      render(<AppTopBar {...defaultProps} LinkComponent={CustomLink} />);

      expect(screen.getByTestId('topbar-navigation')).toBeInTheDocument();
    });
  });

  describe('logo onClick', () => {
    it('calls logo onClick when provided', () => {
      const handleClick = vi.fn();
      render(
        <AppTopBar
          {...defaultProps}
          logo={{ ...defaultProps.logo, onClick: handleClick }}
        />
      );

      screen.getByTestId('topbar-logo').click();
      expect(handleClick).toHaveBeenCalled();
    });
  });

  describe('aria attributes', () => {
    it('has default aria-label', () => {
      render(<AppTopBar {...defaultProps} />);

      expect(screen.getByTestId('topbar')).toHaveAttribute(
        'aria-label',
        'Main navigation'
      );
    });

    it('uses custom aria-label', () => {
      render(<AppTopBar {...defaultProps} ariaLabel='Site navigation' />);

      expect(screen.getByTestId('topbar')).toHaveAttribute(
        'aria-label',
        'Site navigation'
      );
    });
  });
});
