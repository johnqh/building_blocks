import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import {
  AppearanceSettings,
  Theme,
  FontSize,
} from '../components/settings/appearance-settings';

// Mock @sudobility/components Select components
vi.mock('@sudobility/components', () => ({
  Select: ({
    children,
    value,
    onValueChange,
  }: {
    children: React.ReactNode;
    value: string;
    onValueChange: (value: string) => void;
  }) => (
    <div data-testid='select' data-value={value}>
      {React.Children.map(children, child => {
        if (React.isValidElement(child) && child.type === MockSelectTrigger) {
          return child;
        }
        if (React.isValidElement(child) && child.type === MockSelectContent) {
          return React.cloneElement(
            child as React.ReactElement,
            {
              onValueChange,
            } as Record<string, unknown>
          );
        }
        return child;
      })}
    </div>
  ),
  SelectTrigger: MockSelectTrigger,
  SelectValue: ({ placeholder }: { placeholder?: string }) => (
    <span data-testid='select-value'>{placeholder}</span>
  ),
  SelectContent: MockSelectContent,
  SelectItem: ({
    children,
    value,
  }: {
    children: React.ReactNode;
    value: string;
  }) => (
    <option data-testid={`select-item-${value}`} value={value}>
      {children}
    </option>
  ),
  Label: ({
    children,
    htmlFor,
    className,
  }: {
    children: React.ReactNode;
    htmlFor?: string;
    className?: string;
  }) => (
    <label htmlFor={htmlFor} className={className}>
      {children}
    </label>
  ),
}));

function MockSelectTrigger({
  children,
  id,
}: {
  children: React.ReactNode;
  id?: string;
}) {
  return (
    <button data-testid={`select-trigger-${id}`} id={id}>
      {children}
    </button>
  );
}

function MockSelectContent({
  children,
}: {
  children: React.ReactNode;
  onValueChange?: (value: string) => void;
}) {
  return <div data-testid='select-content'>{children}</div>;
}

// Mock @sudobility/design
vi.mock('@sudobility/design', () => ({
  textVariants: {
    heading: {
      h4: () => 'text-xl font-bold',
    },
    body: {
      sm: () => 'text-sm',
      xs: () => 'text-xs',
    },
    label: {
      default: () => 'text-sm font-medium',
    },
  },
}));

const defaultProps = {
  theme: Theme.LIGHT,
  fontSize: FontSize.MEDIUM,
  onThemeChange: vi.fn(),
  onFontSizeChange: vi.fn(),
};

describe('AppearanceSettings', () => {
  it('renders heading and description', () => {
    render(<AppearanceSettings {...defaultProps} />);

    expect(screen.getByText('Appearance')).toBeInTheDocument();
    expect(
      screen.getByText('Customize the look and feel of the application.')
    ).toBeInTheDocument();
  });

  it('renders theme and font size labels', () => {
    render(<AppearanceSettings {...defaultProps} />);

    expect(screen.getByText('Theme')).toBeInTheDocument();
    expect(screen.getByText('Font Size')).toBeInTheDocument();
  });

  it('renders theme options', () => {
    render(<AppearanceSettings {...defaultProps} />);

    expect(screen.getByTestId('select-item-light')).toBeInTheDocument();
    expect(screen.getByTestId('select-item-dark')).toBeInTheDocument();
    expect(screen.getByTestId('select-item-system')).toBeInTheDocument();
  });

  it('renders font size options', () => {
    render(<AppearanceSettings {...defaultProps} />);

    expect(screen.getByTestId('select-item-small')).toBeInTheDocument();
    expect(screen.getByTestId('select-item-medium')).toBeInTheDocument();
    expect(screen.getByTestId('select-item-large')).toBeInTheDocument();
  });

  it('shows info box by default', () => {
    render(<AppearanceSettings {...defaultProps} />);

    expect(screen.getByText('About Settings')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Your appearance preferences are saved locally and will be applied automatically on your next visit.'
      )
    ).toBeInTheDocument();
  });

  it('hides info box when showInfoBox is false', () => {
    render(<AppearanceSettings {...defaultProps} showInfoBox={false} />);

    expect(screen.queryByText('About Settings')).not.toBeInTheDocument();
  });

  it('uses custom translations when t is provided', () => {
    const customT = (key: string) => {
      const translations: Record<string, string> = {
        heading: 'Apariencia',
        description: 'Personaliza la apariencia.',
        themeLabel: 'Tema',
        fontSizeLabel: 'Tamano de fuente',
      };
      return translations[key] || key;
    };

    render(<AppearanceSettings {...defaultProps} t={customT} />);

    expect(screen.getByText('Apariencia')).toBeInTheDocument();
    expect(screen.getByText('Personaliza la apariencia.')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <AppearanceSettings {...defaultProps} className='custom-class' />
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('renders description text for theme and font size', () => {
    render(<AppearanceSettings {...defaultProps} />);

    expect(
      screen.getByText('Choose your preferred color theme.')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Adjust the text size for better readability.')
    ).toBeInTheDocument();
  });
});
