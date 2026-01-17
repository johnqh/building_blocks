/**
 * @fileoverview App Pricing Page
 * @description Public pricing page for displaying subscription options.
 *
 * This component uses Section internally for proper page layout.
 * Do NOT wrap this component in a Section when consuming it.
 */

import { useState, useCallback } from 'react';
import {
  SubscriptionTile,
  SegmentedControl,
} from '@sudobility/subscription-components';
import { useSubscribable } from '@sudobility/subscription_lib';
import { Section } from '@sudobility/components';
import type { AnalyticsTrackingParams } from '../../types';

type BillingPeriod = 'monthly' | 'yearly';

/** Product from subscription provider */
export interface PricingProduct {
  identifier: string;
  title: string;
  price: string;
  priceString: string;
  period?: string;
}

/** FAQ item */
export interface FAQItem {
  question: string;
  answer: string;
}

/** All localized labels for the pricing page */
export interface PricingPageLabels {
  // Header
  title: string;
  subtitle: string;

  // Periods
  periodYear: string;
  periodMonth: string;
  periodWeek: string;

  // Billing period toggle
  billingMonthly: string;
  billingYearly: string;

  // Free tier
  freeTierTitle: string;
  freeTierPrice: string;
  freeTierFeatures: string[];

  // Badges
  currentPlanBadge: string;
  mostPopularBadge: string;

  // CTA buttons
  ctaLogIn: string;
  ctaTryFree: string;
  ctaUpgrade: string;

  // FAQ
  faqTitle: string;
}

/** Formatter functions for dynamic strings */
export interface PricingPageFormatters {
  /** Format savings badge: "Save 20%" */
  formatSavePercent: (percent: number) => string;
  /** Get features for a product by its identifier */
  getProductFeatures: (productId: string) => string[];
}

export interface AppPricingPageProps {
  /** Available subscription products */
  products: PricingProduct[];
  /** Whether user is authenticated */
  isAuthenticated: boolean;
  /** Whether user has an active subscription */
  hasActiveSubscription: boolean;
  /** Current subscription product identifier (if any) */
  currentProductIdentifier?: string;
  /** User ID used for subscription (the selected entity's ID when logged in) */
  subscriptionUserId?: string;
  /** All localized labels */
  labels: PricingPageLabels;
  /** Formatter functions */
  formatters: PricingPageFormatters;
  /** Called when user clicks on a plan */
  onPlanClick: (planIdentifier: string) => void;
  /** Called when user clicks on free plan */
  onFreePlanClick: () => void;
  /** Optional FAQ items */
  faqItems?: FAQItem[];
  /** Optional className for the container */
  className?: string;
  /** Optional analytics tracking callback */
  onTrack?: (params: AnalyticsTrackingParams) => void;
  /**
   * Offer ID for subscription_lib hooks (e.g., "api", "default").
   * Uses useSubscribable hook to determine which packages are enabled.
   */
  offerId: string;
}

/**
 * Public pricing page for displaying subscription options.
 * - Non-authenticated: Free tile shows "Try it for Free", paid tiles show "Log in to Continue"
 * - Authenticated on free: Free tile shows "Current Plan" badge (no CTA), paid tiles show "Upgrade"
 * - Authenticated with subscription: Current plan shows badge (no CTA), higher tiers show "Upgrade"
 */
export function AppPricingPage({
  products,
  isAuthenticated,
  hasActiveSubscription,
  currentProductIdentifier,
  labels,
  formatters,
  onPlanClick,
  onFreePlanClick,
  faqItems,
  className,
  onTrack,
  offerId,
}: AppPricingPageProps) {
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>('monthly');

  // Use subscription_lib hook to get subscribable package IDs
  const { subscribablePackageIds } = useSubscribable(offerId);

  // Helper to track analytics events
  const track = useCallback(
    (label: string, params?: Record<string, unknown>) => {
      onTrack?.({
        eventType: 'subscription_action',
        componentName: 'AppPricingPage',
        label,
        params,
      });
    },
    [onTrack]
  );

  // Handle billing period change with tracking
  const handleBillingPeriodChange = useCallback(
    (value: string) => {
      const newPeriod = value as BillingPeriod;
      setBillingPeriod(newPeriod);
      track('billing_period_changed', { billing_period: newPeriod });
    },
    [track]
  );

  // Handle free plan click with tracking
  const handleFreePlanClick = useCallback(() => {
    track('free_plan_clicked', { plan: 'free' });
    onFreePlanClick();
  }, [track, onFreePlanClick]);

  // Handle paid plan click with tracking
  const handlePlanClick = useCallback(
    (planIdentifier: string, actionType: 'login' | 'upgrade') => {
      track('plan_clicked', {
        plan_identifier: planIdentifier,
        action_type: actionType,
      });
      onPlanClick(planIdentifier);
    },
    [track, onPlanClick]
  );

  // Filter products by billing period and sort by price
  const filteredProducts = products
    .filter(product => {
      if (!product.period) return false;
      const isYearly =
        product.period.includes('Y') || product.period.includes('year');
      return billingPeriod === 'yearly' ? isYearly : !isYearly;
    })
    .sort((a, b) => parseFloat(a.price) - parseFloat(b.price));

  const getPeriodLabel = useCallback(
    (period?: string) => {
      if (!period) return '';
      if (period.includes('Y') || period.includes('year'))
        return labels.periodYear;
      if (period.includes('M') || period.includes('month'))
        return labels.periodMonth;
      if (period.includes('W') || period.includes('week'))
        return labels.periodWeek;
      return '';
    },
    [labels]
  );

  const getYearlySavingsPercent = useCallback(
    (yearlyPackageId: string): number | undefined => {
      const yearlyProduct = products.find(
        p => p.identifier === yearlyPackageId
      );
      if (!yearlyProduct) return undefined;

      // Find monthly equivalent by naming convention (replace _yearly with _monthly)
      const monthlyPackageId = yearlyPackageId.replace('_yearly', '_monthly');
      const monthlyProduct = products.find(
        p => p.identifier === monthlyPackageId
      );
      if (!monthlyProduct) return undefined;

      const yearlyPrice = parseFloat(yearlyProduct.price);
      const monthlyPrice = parseFloat(monthlyProduct.price);

      if (monthlyPrice <= 0 || yearlyPrice <= 0) return undefined;

      const annualizedMonthly = monthlyPrice * 12;
      const savings =
        ((annualizedMonthly - yearlyPrice) / annualizedMonthly) * 100;

      return Math.round(savings);
    },
    [products]
  );

  const billingPeriodOptions = [
    { value: 'monthly' as const, label: labels.billingMonthly },
    { value: 'yearly' as const, label: labels.billingYearly },
  ];

  // Determine if a product is the current plan (exact product identifier match)
  const isCurrentPlan = useCallback(
    (productId: string): boolean => {
      if (!isAuthenticated) return false;
      if (!hasActiveSubscription) return false;
      return productId === currentProductIdentifier;
    },
    [isAuthenticated, hasActiveSubscription, currentProductIdentifier]
  );

  // Determine if a package is subscribable (enabled)
  const isPackageEnabled = useCallback(
    (productId: string): boolean => {
      // Non-authenticated users can see all plans
      if (!isAuthenticated) return true;

      // Use subscription_lib hook results
      return subscribablePackageIds.includes(productId);
    },
    [isAuthenticated, subscribablePackageIds]
  );

  // Determine if a product can be upgraded to
  const canUpgradeTo = useCallback(
    (productId: string): boolean => {
      // If the product is in subscribablePackageIds and it's not the current plan
      return isPackageEnabled(productId) && !isCurrentPlan(productId);
    },
    [isPackageEnabled, isCurrentPlan]
  );

  return (
    <div className={className}>
      {/* Header */}
      <Section spacing='2xl' maxWidth='4xl'>
        <div className='text-center'>
          <h1 className='text-4xl sm:text-5xl font-bold text-theme-text-primary mb-4'>
            {labels.title}
          </h1>
          <p className='text-lg text-theme-text-secondary'>{labels.subtitle}</p>
        </div>
      </Section>

      {/* Pricing Cards */}
      <Section spacing='3xl' maxWidth='6xl'>
        {/* Billing Period Selector */}
        <div className='flex justify-center mb-8'>
          <SegmentedControl
            options={billingPeriodOptions}
            value={billingPeriod}
            onChange={handleBillingPeriodChange}
          />
        </div>

        {/* Subscription Tiles Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
            gridAutoRows: '1fr',
            gap: '1.5rem',
            overflow: 'visible',
          }}
        >
          {/* Free Tier */}
          <SubscriptionTile
            id='free'
            title={labels.freeTierTitle}
            price={labels.freeTierPrice}
            periodLabel={labels.periodMonth}
            features={labels.freeTierFeatures}
            isSelected={false}
            isCurrentPlan={isAuthenticated && !hasActiveSubscription}
            onSelect={() => {}}
            enabled={
              // Free tier enabled: not authenticated, or in subscribable list
              !isAuthenticated || subscribablePackageIds.includes('free')
            }
            topBadge={
              isAuthenticated && !hasActiveSubscription
                ? {
                    text: labels.currentPlanBadge,
                    color: 'green',
                  }
                : undefined
            }
            ctaButton={
              // Not logged in: show "Try it for Free"
              // Logged in on free plan: no CTA (current plan)
              // Logged in with subscription: no CTA (can't downgrade here)
              !isAuthenticated
                ? {
                    label: labels.ctaTryFree,
                    onClick: handleFreePlanClick,
                  }
                : undefined
            }
            hideSelectionIndicator={isAuthenticated}
          />

          {/* Paid Plans */}
          {filteredProducts.map(product => {
            const isCurrent = isCurrentPlan(product.identifier);
            const isEnabled = isPackageEnabled(product.identifier);
            const canUpgrade = canUpgradeTo(product.identifier);

            // Determine CTA button
            let ctaButton: { label: string; onClick: () => void } | undefined;
            if (!isAuthenticated) {
              // Not logged in: show "Log in to Continue"
              ctaButton = {
                label: labels.ctaLogIn,
                onClick: () => handlePlanClick(product.identifier, 'login'),
              };
            } else if (isCurrent) {
              // Current plan: no CTA
              ctaButton = undefined;
            } else if (canUpgrade) {
              // Enabled and not current: show "Upgrade"
              ctaButton = {
                label: labels.ctaUpgrade,
                onClick: () => handlePlanClick(product.identifier, 'upgrade'),
              };
            }
            // Not enabled (downgrade): no CTA

            // Determine top badge
            let topBadge:
              | {
                  text: string;
                  color: 'purple' | 'green' | 'blue' | 'yellow' | 'red';
                }
              | undefined;
            if (isCurrent) {
              topBadge = {
                text: labels.currentPlanBadge,
                color: 'green',
              };
            } else if (product.identifier.includes('pro')) {
              topBadge = {
                text: labels.mostPopularBadge,
                color: 'yellow',
              };
            }

            return (
              <SubscriptionTile
                key={product.identifier}
                id={product.identifier}
                title={product.title}
                price={product.priceString}
                periodLabel={getPeriodLabel(product.period)}
                features={formatters.getProductFeatures(product.identifier)}
                isSelected={false}
                isCurrentPlan={isCurrent}
                onSelect={() => {}}
                enabled={isEnabled}
                isBestValue={product.identifier.includes('pro')}
                topBadge={topBadge}
                discountBadge={
                  product.period?.includes('Y')
                    ? (() => {
                        const savings = getYearlySavingsPercent(
                          product.identifier
                        );
                        return savings && savings > 0
                          ? {
                              text: formatters.formatSavePercent(savings),
                              isBestValue: true,
                            }
                          : undefined;
                      })()
                    : undefined
                }
                ctaButton={ctaButton}
                hideSelectionIndicator={!ctaButton}
              />
            );
          })}
        </div>
      </Section>

      {/* FAQ Section */}
      {faqItems && faqItems.length > 0 && (
        <Section spacing='3xl' background='surface' maxWidth='3xl'>
          <h2 className='text-3xl font-bold text-theme-text-primary text-center mb-12'>
            {labels.faqTitle}
          </h2>

          <div className='space-y-6'>
            {faqItems.map((item, index) => (
              <div
                key={index}
                className='bg-theme-bg-primary p-6 rounded-xl border border-theme-border'
              >
                <h3 className='text-lg font-semibold text-theme-text-primary mb-2'>
                  {item.question}
                </h3>
                <p className='text-theme-text-secondary'>{item.answer}</p>
              </div>
            ))}
          </div>
        </Section>
      )}
    </div>
  );
}
