import React, { useMemo, type ComponentType, type ReactNode } from 'react';
import {
  Topbar,
  TopbarProvider,
  TopbarLeft,
  TopbarCenter,
  TopbarRight,
  TopbarLogo,
  TopbarNavigation,
  TopbarActions,
  TopbarMobileContent,
  Logo,
  type TopbarNavItem,
} from '@sudobility/components';
import { cn } from '../../utils';
import {
  LanguageSelector,
  type LanguageSelectorProps,
} from './language-selector';
import type {
  MenuItemConfig,
  LogoConfig,
  LanguageConfig,
  LinkComponentProps,
} from '../../types';
import { DEFAULT_LANGUAGES } from '../../constants/languages';

export interface AppTopBarProps {
  /** Logo configuration */
  logo: LogoConfig;

  /** Navigation menu items */
  menuItems: MenuItemConfig[];

  /** Available languages for selector (defaults to 16 built-in languages) */
  languages?: LanguageConfig[];

  /** Current language code */
  currentLanguage?: string;

  /** Language change handler */
  onLanguageChange?: (languageCode: string) => void;

  /** Hide language selector */
  hideLanguageSelector?: boolean;

  /** Language selector props override */
  languageSelectorProps?: Partial<LanguageSelectorProps>;

  /** Breakpoint to collapse navigation to hamburger menu */
  collapseBelow?: 'sm' | 'md' | 'lg' | 'xl';

  /** Render prop for account/auth section (right side of topbar) */
  renderAccountSection?: () => ReactNode;

  /** Render prop for center section (e.g., search bar) - shown on desktop */
  renderCenterSection?: () => ReactNode;

  /** Render prop for mobile-specific content (e.g., mobile search) - shown below main topbar on mobile */
  renderMobileContent?: () => ReactNode;

  /** Custom Link component for navigation (for react-router-dom, Next.js, etc.) */
  LinkComponent?: ComponentType<LinkComponentProps>;

  /** Optional sticky positioning */
  sticky?: boolean;

  /** Optional variant */
  variant?: 'default' | 'app';

  /** Mobile menu label for accessibility */
  mobileMenuLabel?: string;

  /** Custom className for topbar */
  className?: string;

  /** z-index level */
  zIndex?: 'default' | 'highest' | 'high';

  /** Aria label for navigation */
  ariaLabel?: string;
}

/**
 * Default Link component that renders a plain anchor tag.
 * Apps should provide their own LinkComponent for router integration.
 */
const DefaultLinkComponent: ComponentType<LinkComponentProps> = ({
  href,
  className,
  children,
  onClick,
}) => (
  <a href={href} className={className} onClick={onClick}>
    {children}
  </a>
);

/**
 * AppTopBar - Base topbar component for Sudobility apps.
 *
 * Features:
 * - Logo with app name on the left
 * - Navigation menu items with icons
 * - Language selector
 * - Render prop for center section (e.g., search bar)
 * - Render prop for account/auth section
 * - Render prop for mobile-specific content
 * - Responsive with hamburger menu on mobile
 * - Dark mode support
 */
export const AppTopBar: React.FC<AppTopBarProps> = ({
  logo,
  menuItems,
  languages = DEFAULT_LANGUAGES,
  currentLanguage = 'en',
  onLanguageChange,
  hideLanguageSelector = false,
  languageSelectorProps,
  collapseBelow = 'lg',
  renderAccountSection,
  renderCenterSection,
  renderMobileContent,
  LinkComponent = DefaultLinkComponent,
  sticky = true,
  variant = 'default',
  mobileMenuLabel = 'Menu',
  className,
  zIndex = 'highest',
  ariaLabel = 'Main navigation',
}) => {
  // Filter menu items that should be shown
  const visibleMenuItems = useMemo(
    () => menuItems.filter(item => item.show !== false),
    [menuItems]
  );

  // Convert MenuItemConfig to TopbarNavItem
  const navItems: TopbarNavItem[] = useMemo(
    () =>
      visibleMenuItems.map(item => ({
        id: item.id,
        label: item.label,
        icon: item.icon,
        href: item.href,
        className: item.className,
      })),
    [visibleMenuItems]
  );

  // Wrapper to adapt LinkComponent to TopbarNavigation expected interface
  const LinkWrapper: ComponentType<{
    href: string;
    className?: string;
    children: ReactNode;
  }> = useMemo(
    () =>
      ({ href, className, children }) => (
        <LinkComponent href={href} className={className}>
          {children}
        </LinkComponent>
      ),
    [LinkComponent]
  );

  const handleLogoClick = () => {
    logo.onClick?.();
  };

  return (
    <TopbarProvider variant={variant} sticky={sticky}>
      <Topbar
        variant={variant}
        sticky={sticky}
        zIndex={zIndex}
        aria-label={ariaLabel}
        className={cn(className)}
      >
        <TopbarLeft>
          {navItems.length > 0 ? (
            <TopbarNavigation
              items={navItems}
              collapseBelow={collapseBelow}
              LinkComponent={LinkWrapper}
              mobileMenuLabel={mobileMenuLabel}
            >
              <TopbarLogo onClick={handleLogoClick} size='md'>
                <Logo
                  size='md'
                  logoSrc={logo.src}
                  logoText={logo.appName}
                  logoAlt={logo.alt || logo.appName}
                  showText={true}
                />
              </TopbarLogo>
            </TopbarNavigation>
          ) : (
            <TopbarLogo onClick={handleLogoClick} size='md'>
              <Logo
                size='md'
                logoSrc={logo.src}
                logoText={logo.appName}
                logoAlt={logo.alt || logo.appName}
                showText={true}
              />
            </TopbarLogo>
          )}
        </TopbarLeft>

        {renderCenterSection && (
          <TopbarCenter>{renderCenterSection()}</TopbarCenter>
        )}

        <TopbarRight>
          <TopbarActions gap='md'>
            {!hideLanguageSelector && (
              <LanguageSelector
                languages={languages}
                currentLanguage={currentLanguage}
                onLanguageChange={onLanguageChange}
                variant='compact'
                {...languageSelectorProps}
              />
            )}
            {renderAccountSection?.()}
          </TopbarActions>
        </TopbarRight>

        {renderMobileContent && (
          <TopbarMobileContent>{renderMobileContent()}</TopbarMobileContent>
        )}
      </Topbar>
    </TopbarProvider>
  );
};

export default AppTopBar;
