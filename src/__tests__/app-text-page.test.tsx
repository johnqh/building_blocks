import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { AppTextPage } from '../components/pages/app-text-page';

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

describe('AppTextPage', () => {
  it('renders page title', () => {
    render(
      <AppTextPage
        text={{
          title: 'Privacy Policy',
          sections: [],
        }}
      />
    );

    expect(screen.getByText('Privacy Policy')).toBeInTheDocument();
  });

  it('renders last updated text with date replacement', () => {
    render(
      <AppTextPage
        text={{
          title: 'Terms',
          lastUpdated: 'Last updated: {{date}}',
          sections: [],
        }}
        lastUpdatedDate='January 1, 2025'
      />
    );

    expect(
      screen.getByText('Last updated: January 1, 2025')
    ).toBeInTheDocument();
  });

  it('renders content sections', () => {
    render(
      <AppTextPage
        text={{
          title: 'Privacy',
          sections: [
            {
              title: 'Introduction',
              content: 'We respect your privacy.',
            },
          ],
        }}
      />
    );

    expect(screen.getByText('Introduction')).toBeInTheDocument();
    expect(screen.getByText('We respect your privacy.')).toBeInTheDocument();
  });

  it('renders list sections', () => {
    render(
      <AppTextPage
        text={{
          title: 'Privacy',
          sections: [
            {
              title: 'Data We Collect',
              description: 'We collect the following:',
              items: ['Email addresses', 'Usage data'],
            },
          ],
        }}
      />
    );

    expect(screen.getByText('Data We Collect')).toBeInTheDocument();
    expect(screen.getByText('We collect the following:')).toBeInTheDocument();
  });

  it('renders subsection sections', () => {
    render(
      <AppTextPage
        text={{
          title: 'Privacy',
          sections: [
            {
              title: 'Information Collection',
              subsections: [
                {
                  title: 'Information You Provide',
                  items: ['Name', 'Email'],
                },
                {
                  title: 'Automatic Information',
                  items: ['IP Address', 'Browser type'],
                },
              ],
            },
          ],
        }}
      />
    );

    expect(screen.getByText('Information Collection')).toBeInTheDocument();
    expect(screen.getByText('Information You Provide')).toBeInTheDocument();
    expect(screen.getByText('Automatic Information')).toBeInTheDocument();
  });

  it('renders contact section', () => {
    render(
      <AppTextPage
        text={{
          title: 'Privacy',
          sections: [],
          contact: {
            title: 'Contact Us',
            description: 'If you have questions, please contact us.',
            info: {
              emailLabel: 'Email:',
              email: 'support@example.com',
              websiteLabel: 'Website:',
              websiteUrl: 'https://example.com',
            },
          },
        }}
      />
    );

    expect(screen.getByText('Contact Us')).toBeInTheDocument();
    expect(
      screen.getByText('If you have questions, please contact us.')
    ).toBeInTheDocument();
    expect(screen.getByText('support@example.com')).toBeInTheDocument();
    expect(screen.getByText('https://example.com')).toBeInTheDocument();
  });

  it('renders DPO information when provided', () => {
    render(
      <AppTextPage
        text={{
          title: 'Privacy',
          sections: [],
          contact: {
            title: 'Contact',
            description: 'Contact us.',
            info: {
              emailLabel: 'Email:',
              email: 'support@example.com',
              websiteLabel: 'Website:',
              websiteUrl: 'https://example.com',
              dpoLabel: 'DPO:',
              dpoEmail: 'dpo@example.com',
            },
          },
        }}
      />
    );

    expect(screen.getByText('dpo@example.com')).toBeInTheDocument();
  });

  it('renders GDPR notice when provided', () => {
    render(
      <AppTextPage
        text={{
          title: 'Privacy',
          sections: [],
          contact: {
            title: 'Contact',
            description: 'Contact us.',
            info: {
              emailLabel: 'Email:',
              email: 'support@example.com',
              websiteLabel: 'Website:',
              websiteUrl: 'https://example.com',
            },
            gdprNotice: {
              title: 'GDPR Rights',
              content: 'You have the right to access your data.',
            },
          },
        }}
      />
    );

    expect(screen.getByText('GDPR Rights')).toBeInTheDocument();
    expect(
      screen.getByText(/You have the right to access your data./)
    ).toBeInTheDocument();
  });

  it('wraps content with PageWrapper when provided', () => {
    const Wrapper = ({ children }: { children: React.ReactNode }) => (
      <div data-testid='page-wrapper'>{children}</div>
    );

    render(
      <AppTextPage
        text={{
          title: 'Privacy',
          sections: [],
        }}
        PageWrapper={Wrapper}
      />
    );

    expect(screen.getByTestId('page-wrapper')).toBeInTheDocument();
    expect(screen.getByText('Privacy')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(
      <AppTextPage
        text={{
          title: 'Terms',
          sections: [],
        }}
        className='custom-text-page'
      />
    );

    expect(screen.getByTestId('section')).toHaveClass('custom-text-page');
  });
});
