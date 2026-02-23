import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { GlobalSettingsPage } from '../components/settings/global-settings-page';
import { Theme, FontSize } from '../components/settings/appearance-settings';

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
  MasterDetailLayout: ({
    masterTitle,
    masterContent,
    detailContent,
    detailTitle,
    backButtonText,
    onBackToNavigation,
  }: {
    masterTitle: string;
    masterContent: React.ReactNode;
    detailContent: React.ReactNode;
    detailTitle: string;
    backButtonText: string;
    onBackToNavigation: () => void;
    mobileView?: string;
    masterWidth?: number;
    stickyMaster?: boolean;
    enableAnimations?: boolean;
  }) => (
    <div data-testid='master-detail-layout'>
      <div data-testid='master-panel'>
        <h2>{masterTitle}</h2>
        {masterContent}
      </div>
      <div data-testid='detail-panel'>
        <button onClick={onBackToNavigation}>{backButtonText}</button>
        <h3>{detailTitle}</h3>
        {detailContent}
      </div>
    </div>
  ),
  MasterListItem: ({
    isSelected,
    onClick,
    label,
    description,
  }: {
    isSelected: boolean;
    onClick: () => void;
    icon: React.ComponentType;
    label: string;
    description: string;
  }) => (
    <button
      data-testid={`settings-item-${label.toLowerCase().replace(/\s+/g, '-')}`}
      data-selected={isSelected}
      onClick={onClick}
    >
      <span>{label}</span>
      <span>{description}</span>
    </button>
  ),
  // Also mock the Select components for nested AppearanceSettings
  Select: ({ children }: { children: React.ReactNode }) => (
    <div data-testid='select'>{children}</div>
  ),
  SelectTrigger: ({ children }: { children: React.ReactNode; id?: string }) => (
    <button>{children}</button>
  ),
  SelectValue: ({ placeholder }: { placeholder?: string }) => (
    <span>{placeholder}</span>
  ),
  SelectContent: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  SelectItem: ({ children }: { children: React.ReactNode; value: string }) => (
    <div>{children}</div>
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

// Mock @heroicons/react
vi.mock('@heroicons/react/24/outline', () => ({
  PaintBrushIcon: ({ className }: { className?: string }) => (
    <svg data-testid='paint-brush-icon' className={className} />
  ),
}));

const defaultProps = {
  theme: Theme.LIGHT,
  fontSize: FontSize.MEDIUM,
  onThemeChange: vi.fn(),
  onFontSizeChange: vi.fn(),
};

describe('GlobalSettingsPage', () => {
  it('renders the settings page with title', () => {
    render(<GlobalSettingsPage {...defaultProps} />);

    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('renders appearance section by default', () => {
    render(<GlobalSettingsPage {...defaultProps} />);

    expect(screen.getByTestId('settings-item-appearance')).toBeInTheDocument();
    // "Appearance" appears multiple times (nav item, detail title, heading)
    expect(screen.getAllByText('Appearance').length).toBeGreaterThanOrEqual(1);
  });

  it('renders appearance content in detail panel', () => {
    render(<GlobalSettingsPage {...defaultProps} />);

    // The detail panel should show appearance settings content
    const detailPanel = screen.getByTestId('detail-panel');
    expect(detailPanel).toBeInTheDocument();
  });

  it('renders additional sections when provided', () => {
    const MockIcon = ({ className }: { className?: string }) => (
      <svg className={className} />
    );

    render(
      <GlobalSettingsPage
        {...defaultProps}
        additionalSections={[
          {
            id: 'notifications',
            icon: MockIcon,
            label: 'Notifications',
            description: 'Manage notifications',
            content: <div>Notification settings content</div>,
          },
        ]}
      />
    );

    expect(
      screen.getByTestId('settings-item-notifications')
    ).toBeInTheDocument();
    expect(screen.getByText('Notifications')).toBeInTheDocument();
  });

  it('switches section when clicking on a section item', () => {
    const MockIcon = ({ className }: { className?: string }) => (
      <svg className={className} />
    );

    render(
      <GlobalSettingsPage
        {...defaultProps}
        additionalSections={[
          {
            id: 'notifications',
            icon: MockIcon,
            label: 'Notifications',
            description: 'Manage notifications',
            content: (
              <div data-testid='notification-content'>
                Notification settings
              </div>
            ),
          },
        ]}
      />
    );

    // Click on notifications section
    fireEvent.click(screen.getByTestId('settings-item-notifications'));

    // Notification content should now be in the detail panel
    expect(screen.getByTestId('notification-content')).toBeInTheDocument();
  });

  it('calls onTrack when section is selected', () => {
    const onTrack = vi.fn();
    const MockIcon = ({ className }: { className?: string }) => (
      <svg className={className} />
    );

    render(
      <GlobalSettingsPage
        {...defaultProps}
        onTrack={onTrack}
        additionalSections={[
          {
            id: 'notifications',
            icon: MockIcon,
            label: 'Notifications',
            description: 'Manage notifications',
            content: <div>Content</div>,
          },
        ]}
      />
    );

    fireEvent.click(screen.getByTestId('settings-item-notifications'));

    expect(onTrack).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: 'settings_change',
        componentName: 'GlobalSettingsPage',
        label: 'section_selected',
        params: { section_id: 'notifications' },
      })
    );
  });

  it('applies custom className', () => {
    render(
      <GlobalSettingsPage {...defaultProps} className='custom-settings' />
    );

    expect(screen.getByTestId('section')).toHaveClass('custom-settings');
  });

  it('uses custom translations when t is provided', () => {
    const customT = (key: string) => {
      const translations: Record<string, string> = {
        title: 'Configuracion',
        backButton: 'Volver',
        appearanceLabel: 'Apariencia',
        appearanceDescription: 'Tema y tamano de fuente',
      };
      return translations[key] || key;
    };

    render(<GlobalSettingsPage {...defaultProps} t={customT} />);

    expect(screen.getByText('Configuracion')).toBeInTheDocument();
    // "Apariencia" appears in both nav item and detail title
    expect(screen.getAllByText('Apariencia').length).toBeGreaterThanOrEqual(1);
  });

  it('renders back button in detail panel', () => {
    render(<GlobalSettingsPage {...defaultProps} />);

    expect(screen.getByText('Back')).toBeInTheDocument();
  });
});
