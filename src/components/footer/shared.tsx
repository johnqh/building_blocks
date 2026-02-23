import { type ComponentType } from 'react';
import type { LinkComponentProps } from '../../types';

/**
 * Default link component that renders a plain anchor.
 * Shared between AppFooter and AppFooterForHomePage.
 */
export const DefaultLinkComponent: ComponentType<LinkComponentProps> = ({
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
 * Helper to get copyright year or range.
 * Shared between AppFooter and AppFooterForHomePage.
 *
 * @param startYear - The starting year for the copyright range (default: 2025)
 * @returns A string representing the year or year range
 */
export function getCopyrightYear(startYear = 2025): string {
  const currentYear = new Date().getFullYear();
  if (currentYear === startYear) {
    return String(startYear);
  } else if (currentYear > startYear) {
    return `${startYear}-${currentYear}`;
  }
  return String(startYear);
}
