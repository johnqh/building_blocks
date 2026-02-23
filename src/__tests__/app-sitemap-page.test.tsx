import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { AppSitemapPage } from '../components/pages/app-sitemap-page';

// Mock @sudobility/components
vi.mock('@sudobility/components', () => ({
  Section: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => (
    <section data-testid='section' className={className}>
      {children}
    </section>
  ),
}));

// Mock @heroicons/react
vi.mock('@heroicons/react/24/outline', () => ({
  ChevronRightIcon: ({ className }: { className?: string }) => (
    <svg data-testid='chevron-icon' className={className} />
  ),
  HomeIcon: ({ className }: { className?: string }) => (
    <svg data-testid='home-icon' className={className} />
  ),
  DocumentTextIcon: ({ className }: { className?: string }) => (
    <svg data-testid='document-icon' className={className} />
  ),
  EnvelopeIcon: ({ className }: { className?: string }) => (
    <svg data-testid='envelope-icon' className={className} />
  ),
  CogIcon: ({ className }: { className?: string }) => (
    <svg data-testid='cog-icon' className={className} />
  ),
  LanguageIcon: ({ className }: { className?: string }) => (
    <svg data-testid='language-icon' className={className} />
  ),
}));

const MockLink = ({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
  language?: string;
}) => (
  <a href={href} className={className}>
    {children}
  </a>
);

const defaultText = {
  title: 'Sitemap',
  subtitle: 'Explore all pages',
  languagesSectionTitle: 'Languages',
  languagesDescription: 'Available in multiple languages',
  quickLinksTitle: 'Quick Links',
};

describe('AppSitemapPage', () => {
  it('renders page title and subtitle', () => {
    render(
      <AppSitemapPage
        text={defaultText}
        sections={[]}
        languages={[]}
        LinkComponent={MockLink}
      />
    );

    expect(screen.getByText('Sitemap')).toBeInTheDocument();
    expect(screen.getByText('Explore all pages')).toBeInTheDocument();
  });

  it('renders sections with links', () => {
    render(
      <AppSitemapPage
        text={defaultText}
        sections={[
          {
            title: 'Main',
            icon: 'home',
            links: [
              { path: '/', label: 'Home' },
              { path: '/about', label: 'About', description: 'Learn more' },
            ],
          },
        ]}
        languages={[]}
        LinkComponent={MockLink}
      />
    );

    expect(screen.getByText('Main')).toBeInTheDocument();
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('About')).toBeInTheDocument();
    expect(screen.getByText('Learn more')).toBeInTheDocument();
  });

  it('renders language section when languages are provided', () => {
    render(
      <AppSitemapPage
        text={defaultText}
        sections={[]}
        languages={[
          { code: 'en', name: 'English', flag: 'US' },
          { code: 'es', name: 'Spanish', flag: 'ES' },
        ]}
        LinkComponent={MockLink}
      />
    );

    expect(screen.getByText('Languages')).toBeInTheDocument();
    expect(screen.getByText('English')).toBeInTheDocument();
    expect(screen.getByText('Spanish')).toBeInTheDocument();
  });

  it('does not render language section when languages array is empty', () => {
    render(
      <AppSitemapPage
        text={defaultText}
        sections={[]}
        languages={[]}
        LinkComponent={MockLink}
      />
    );

    expect(screen.queryByText('Languages')).not.toBeInTheDocument();
  });

  it('renders quick links when provided', () => {
    render(
      <AppSitemapPage
        text={defaultText}
        sections={[]}
        languages={[]}
        quickLinks={[
          {
            path: '/contact',
            label: 'Contact Us',
            variant: 'primary',
            icon: 'envelope',
          },
          { path: '/docs', label: 'Documentation', variant: 'secondary' },
        ]}
        LinkComponent={MockLink}
      />
    );

    expect(screen.getByText('Quick Links')).toBeInTheDocument();
    expect(screen.getByText('Contact Us')).toBeInTheDocument();
    expect(screen.getByText('Documentation')).toBeInTheDocument();
  });

  it('does not render quick links when not provided', () => {
    render(
      <AppSitemapPage
        text={defaultText}
        sections={[]}
        languages={[]}
        LinkComponent={MockLink}
      />
    );

    expect(screen.queryByText('Quick Links')).not.toBeInTheDocument();
  });

  it('wraps content with PageWrapper when provided', () => {
    const Wrapper = ({ children }: { children: React.ReactNode }) => (
      <div data-testid='page-wrapper'>{children}</div>
    );

    render(
      <AppSitemapPage
        text={defaultText}
        sections={[]}
        languages={[]}
        LinkComponent={MockLink}
        PageWrapper={Wrapper}
      />
    );

    expect(screen.getByTestId('page-wrapper')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(
      <AppSitemapPage
        text={defaultText}
        sections={[]}
        languages={[]}
        LinkComponent={MockLink}
        className='custom-sitemap'
      />
    );

    expect(screen.getByTestId('section')).toHaveClass('custom-sitemap');
  });

  it('renders multiple sections', () => {
    render(
      <AppSitemapPage
        text={defaultText}
        sections={[
          {
            title: 'Main',
            links: [{ path: '/', label: 'Home' }],
          },
          {
            title: 'Legal',
            icon: 'document',
            links: [
              { path: '/privacy', label: 'Privacy' },
              { path: '/terms', label: 'Terms' },
            ],
          },
        ]}
        languages={[]}
        LinkComponent={MockLink}
      />
    );

    expect(screen.getByText('Main')).toBeInTheDocument();
    expect(screen.getByText('Legal')).toBeInTheDocument();
    expect(screen.getByText('Privacy')).toBeInTheDocument();
    expect(screen.getByText('Terms')).toBeInTheDocument();
  });
});
