import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AppFooter } from '../components/footer/app-footer';
import React from 'react';

// Mock the Footer components from @sudobility/components
vi.mock('@sudobility/components', () => ({
  Footer: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => (
    <footer className={className} data-testid='footer'>
      {children}
    </footer>
  ),
  FooterCompact: ({ children }: { children: React.ReactNode }) => (
    <div data-testid='footer-compact'>{children}</div>
  ),
  FooterCompactLeft: ({ children }: { children: React.ReactNode }) => (
    <div data-testid='footer-left'>{children}</div>
  ),
  FooterCompactRight: ({ children }: { children: React.ReactNode }) => (
    <div data-testid='footer-right'>{children}</div>
  ),
  FooterVersion: ({ version }: { version: string }) => (
    <span data-testid='footer-version'>v{version}</span>
  ),
  FooterCopyright: ({
    year,
    companyName,
    rightsText,
    companyLink,
  }: {
    year: string;
    companyName: string;
    rightsText: string;
    companyLink?: React.ReactNode;
  }) => (
    <span data-testid='footer-copyright'>
      © {year} {companyLink || companyName}. {rightsText}
    </span>
  ),
}));

describe('AppFooter', () => {
  it('renders with required props', () => {
    render(<AppFooter companyName='Test Company' />);
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });

  it('displays version when provided', () => {
    render(<AppFooter companyName='Test Company' version='1.0.0' />);
    expect(screen.getByTestId('footer-version')).toHaveTextContent('v1.0.0');
  });

  it('does not display version when not provided', () => {
    render(<AppFooter companyName='Test Company' />);
    expect(screen.queryByTestId('footer-version')).not.toBeInTheDocument();
  });

  it('displays company name in copyright', () => {
    render(<AppFooter companyName='Acme Inc' />);
    expect(screen.getByTestId('footer-copyright')).toHaveTextContent(
      'Acme Inc'
    );
  });

  it('displays rights text', () => {
    render(
      <AppFooter companyName='Test Company' rightsText='Some rights reserved' />
    );
    expect(screen.getByTestId('footer-copyright')).toHaveTextContent(
      'Some rights reserved'
    );
  });

  it('uses default rights text when not provided', () => {
    render(<AppFooter companyName='Test Company' />);
    expect(screen.getByTestId('footer-copyright')).toHaveTextContent(
      'All rights reserved'
    );
  });

  it('uses custom copyright year when provided', () => {
    render(<AppFooter companyName='Test Company' copyrightYear='2020-2025' />);
    expect(screen.getByTestId('footer-copyright')).toHaveTextContent(
      '2020-2025'
    );
  });

  describe('links', () => {
    it('renders links when provided', () => {
      render(
        <AppFooter
          companyName='Test Company'
          links={[
            { label: 'Privacy', href: '/privacy' },
            { label: 'Terms', href: '/terms' },
          ]}
        />
      );

      expect(screen.getByText('Privacy')).toBeInTheDocument();
      expect(screen.getByText('Terms')).toBeInTheDocument();
    });

    it('renders links with correct hrefs', () => {
      render(
        <AppFooter
          companyName='Test Company'
          links={[{ label: 'Privacy', href: '/privacy' }]}
        />
      );

      expect(screen.getByText('Privacy')).toHaveAttribute('href', '/privacy');
    });

    it('renders button links with onClick handlers', () => {
      const handleClick = vi.fn();
      render(
        <AppFooter
          companyName='Test Company'
          links={[{ label: 'Click Me', href: '#', onClick: handleClick }]}
        />
      );

      fireEvent.click(screen.getByText('Click Me'));
      expect(handleClick).toHaveBeenCalled();
    });
  });

  describe('company URL', () => {
    it('renders company name as link when companyUrl is provided', () => {
      render(
        <AppFooter
          companyName='Test Company'
          companyUrl='https://example.com'
        />
      );

      const link = screen.getByRole('link', { name: 'Test Company' });
      expect(link).toHaveAttribute('href', 'https://example.com');
    });
  });

  describe('custom className', () => {
    it('applies custom className', () => {
      render(
        <AppFooter companyName='Test Company' className='custom-footer' />
      );
      expect(screen.getByTestId('footer')).toHaveClass('custom-footer');
    });
  });

  describe('custom LinkComponent', () => {
    it('uses custom LinkComponent for links', () => {
      const CustomLink = ({
        href,
        children,
      }: {
        href?: string;
        children: React.ReactNode;
      }) => (
        <a href={href} data-custom='true'>
          {children}
        </a>
      );

      render(
        <AppFooter
          companyName='Test Company'
          links={[{ label: 'Custom Link', href: '/custom' }]}
          LinkComponent={CustomLink}
        />
      );

      expect(screen.getByText('Custom Link')).toHaveAttribute(
        'data-custom',
        'true'
      );
    });
  });

  describe('status indicator', () => {
    it('renders status indicator when both config and component are provided', () => {
      const MockStatusIndicator = ({
        statusPageUrl,
      }: {
        statusPageUrl: string;
      }) => <div data-testid='status-indicator'>{statusPageUrl}</div>;

      render(
        <AppFooter
          companyName='Test Company'
          version='1.0.0'
          statusIndicator={{
            statusPageUrl: 'https://status.example.com',
          }}
          StatusIndicatorComponent={MockStatusIndicator}
        />
      );

      expect(screen.getByTestId('status-indicator')).toBeInTheDocument();
    });

    it('does not render status indicator when component is not provided', () => {
      render(
        <AppFooter
          companyName='Test Company'
          statusIndicator={{
            statusPageUrl: 'https://status.example.com',
          }}
        />
      );

      expect(screen.queryByTestId('status-indicator')).not.toBeInTheDocument();
    });
  });
});
