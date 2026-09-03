import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AppBreadcrumbs } from '../components/breadcrumbs/app-breadcrumbs';

// Mock the BreadcrumbSection from @sudobility/components
vi.mock('@sudobility/components', () => ({
  // Mirrors LayoutContext's out-of-provider fallback, so these tests exercise
  // the same widths a standalone AppBreadcrumbs gets in an app.
  useLayout: () => ({
    mode: 'standard',
    containerClass: 'max-w-7xl mx-auto px-4',
    maxWidthClass: 'max-w-7xl mx-auto',
    paddingClass: 'px-4',
  }),
  BreadcrumbSection: ({
    items,
  }: {
    items: Array<{ label: string; href?: string; current?: boolean }>;
  }) => (
    <nav aria-label='Breadcrumb'>
      <ol>
        {items.map((item, i) => (
          <li key={i}>
            {item.href && !item.current ? (
              <a href={item.href}>{item.label}</a>
            ) : (
              <span>{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  ),
}));

const testItems = [
  { label: 'Home', href: '/' },
  { label: 'Products', href: '/products' },
  { label: 'Widget', current: true },
];

describe('AppBreadcrumbs', () => {
  it('renders breadcrumb items', () => {
    render(<AppBreadcrumbs items={testItems} />);

    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Products')).toBeInTheDocument();
    expect(screen.getByText('Widget')).toBeInTheDocument();
  });

  it('returns null when items array is empty', () => {
    const { container } = render(<AppBreadcrumbs items={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('returns null when items is undefined', () => {
    // @ts-expect-error - testing undefined case
    const { container } = render(<AppBreadcrumbs items={undefined} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders with default variant', () => {
    const { container } = render(<AppBreadcrumbs items={testItems} />);
    expect(container.firstChild).toHaveClass('border-b');
  });

  it('applies custom className', () => {
    const { container } = render(
      <AppBreadcrumbs items={testItems} className='custom-class' />
    );
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('hides the bar below the sm breakpoint by default', () => {
    const { container } = render(<AppBreadcrumbs items={testItems} />);
    expect(container.firstChild).toHaveClass('hidden');
    expect(container.firstChild).toHaveClass('sm:block');
  });

  it('stays visible at every width when hideOnMobile is false', () => {
    const { container } = render(
      <AppBreadcrumbs items={testItems} hideOnMobile={false} />
    );
    expect(container.firstChild).not.toHaveClass('hidden');
    expect(container.firstChild).not.toHaveClass('sm:block');
  });

  it('applies content className', () => {
    const { container } = render(
      <AppBreadcrumbs items={testItems} contentClassName='content-custom' />
    );
    // The content div should have the custom class
    expect(container.querySelector('.content-custom')).toBeInTheDocument();
  });

  describe('Talk to Founder button', () => {
    it('renders Talk to Founder button when config is provided', () => {
      render(
        <AppBreadcrumbs
          items={testItems}
          talkToFounder={{
            meetingUrl: 'https://calendly.com/founder',
            buttonText: 'Book a call',
          }}
        />
      );

      expect(screen.getByText('Book a call')).toBeInTheDocument();
    });

    it('uses default button text when not provided', () => {
      render(
        <AppBreadcrumbs
          items={testItems}
          talkToFounder={{
            meetingUrl: 'https://calendly.com/founder',
          }}
        />
      );

      expect(screen.getByText('Talk to Founder')).toBeInTheDocument();
    });

    it('opens meeting URL in new tab', () => {
      render(
        <AppBreadcrumbs
          items={testItems}
          talkToFounder={{
            meetingUrl: 'https://calendly.com/founder',
          }}
        />
      );

      const link = screen.getByRole('link', { name: /Talk to Founder/ });
      expect(link).toHaveAttribute('href', 'https://calendly.com/founder');
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });

  describe('variants', () => {
    it('applies transparent variant', () => {
      const { container } = render(
        <AppBreadcrumbs items={testItems} variant='transparent' />
      );
      expect(container.firstChild).toHaveClass('bg-transparent');
    });

    it('applies subtle variant', () => {
      const { container } = render(
        <AppBreadcrumbs items={testItems} variant='subtle' />
      );
      expect(container.firstChild).toHaveClass('bg-gray-50');
    });
  });
});
