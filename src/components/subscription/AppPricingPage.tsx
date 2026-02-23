/**
 * @fileoverview App Pricing Page
 * @description Public pricing page for displaying subscription options.
 *
 * This component uses Section internally for proper page layout.
 * Do NOT wrap this component in a Section when consuming it.
 *
 * Uses subscription_lib hooks directly for all subscription data:
 * - useSubscriptionPeriods: Get available billing periods
 * - useSubscriptionForPeriod: Get packages for selected period
 * - useSubscribable: Determine which packages are enabled
 */

import { useState, useCallback, useMemo, useEffect } from 'react';
import {
  SubscriptionTile,
  SegmentedControl,
} from '@sudobility/subscription-components';
import {
  useSubscribable,
  useSubscriptionPeriods,
  useSubscriptionForPeriod,
  useUserSubscription,
  refreshSubscription,
} from '@sudobility/subscription_lib';
import type { SubscriptionPeriod } from '@sudobility/types';
import { Section } from '@sudobility/components';
import type { AnalyticsTrackingParams } from '../../types';

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
  /** Whether user is authenticated */
  isAuthenticated: boolean;
  /** All localized labels */
  labels: PricingPageLabels;
  /** Formatter functions */
  formatters: PricingPageFormatters;
  /** Called when non-authenticated user clicks on a plan (e.g., redirect to login) */
  onPlanClick: (planIdentifier: string) => void;
  /** Called when user clicks on free plan */
  onFreePlanClick: () => void;
  /** Purchase handler for authenticated users - called with packageId */
  onPurchase?: (packageId: string) => Promise<boolean>;
  /** Called when purchase succeeds */
  onPurchaseSuccess?: () => void;
  /** Called on purchase error */
  onPurchaseError?: (error: Error) => void;
  /** Optional FAQ items */
  faqItems?: FAQItem[];
  /** Optional className for the container */
  className?: string;
  /** Optional analytics tracking callback */
  onTrack?: (params: AnalyticsTrackingParams) => void;
  /** Offer ID for subscription_lib hooks */
  offerId: string;
}

/**
 * Public pricing page for displaying subscription options.
 * Uses subscription_lib hooks directly for all subscription data.
 *
 * - Non-authenticated: Free tile shows "Try it for Free", paid tiles show "Log in to Continue"
 * - Authenticated on free: Free tile shows "Current Plan" badge (no CTA), paid tiles show "Upgrade"
 * - Authenticated with subscription: Current plan shows badge (no CTA), higher tiers show "Upgrade"
 */
export function AppPricingPage({
  isAuthenticated,
  labels,
  formatters,
  onPlanClick,
  onFreePlanClick,
  onPurchase,
  onPurchaseSuccess,
  onPurchaseError,
  faqItems,
  className,
  onTrack,
  offerId,
}: AppPricingPageProps) {
  const [isPurchasing, setIsPurchasing] = useState(false);
  // Get current user subscription from subscription_lib (single source of truth)
  const {
    subscription: currentSubscription,
    isLoading: subscriptionLoading,
    error: subscriptionError,
    update: updateSubscription,
  } = useUserSubscription();

  // Refresh subscription data when page becomes visible (e.g., returning from purchase flow)
  useEffect(() => {
    updateSubscription();
  }, [updateSubscription]);

  // Derive subscription state from hook
  const hasActiveSubscription = currentSubscription?.isActive ?? false;
  const currentProductIdentifier = currentSubscription?.productId;

  // Get available periods from subscription_lib
  const {
    periods,
    isLoading: periodsLoading,
    error: periodsError,
  } = useSubscriptionPeriods(offerId);

  // Default to first available period, or 'monthly' as fallback
  const [selectedPeriod, setSelectedPeriod] =
    useState<SubscriptionPeriod>('monthly');

  // Update selected period when periods become available
  useEffect(() => {
    if (periods.length > 0 && !periods.includes(selectedPeriod)) {
      setSelectedPeriod(periods[0]);
    }
  }, [periods, selectedPeriod]);

  // Get packages for selected period
  const {
    packages,
    isLoading: packagesLoading,
    error: packagesError,
  } = useSubscriptionForPeriod(offerId, selectedPeriod);

  // Get subscribable package IDs
  const {
    subscribablePackageIds,
    isLoading: subscribableLoading,
    error: subscribableError,
  } = useSubscribable(offerId);

  const isLoading =
    periodsLoading ||
    packagesLoading ||
    subscribableLoading ||
    subscriptionLoading ||
    isPurchasing;
  const error =
    periodsError || packagesError || subscribableError || subscriptionError;

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
      const newPeriod = value as SubscriptionPeriod;
      setSelectedPeriod(newPeriod);
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
    async (planIdentifier: string, actionType: 'login' | 'upgrade') => {
      track('plan_clicked', {
        plan_identifier: planIdentifier,
        action_type: actionType,
      });

      // For non-authenticated users, just call onPlanClick (e.g., redirect to login)
      if (actionType === 'login') {
        onPlanClick(planIdentifier);
        return;
      }

      // For authenticated users with onPurchase, handle purchase flow
      if (onPurchase) {
        setIsPurchasing(true);
        try {
          const result = await onPurchase(planIdentifier);
          if (result) {
            // Refresh subscription data to sync state
            await refreshSubscription();
            track('purchase_completed', { plan_identifier: planIdentifier });
            onPurchaseSuccess?.();
          }
        } catch (err) {
          track('purchase_failed', {
            plan_identifier: planIdentifier,
            reason: err instanceof Error ? err.message : 'Unknown error',
          });
          onPurchaseError?.(
            err instanceof Error ? err : new Error('Purchase failed')
          );
        } finally {
          setIsPurchasing(false);
        }
      } else {
        // Fallback to onPlanClick if onPurchase not provided
        onPlanClick(planIdentifier);
      }
    },
    [track, onPlanClick, onPurchase, onPurchaseSuccess, onPurchaseError]
  );

  const getPeriodLabel = useCallback(
    (period: SubscriptionPeriod) => {
      switch (period) {
        case 'yearly':
          return labels.periodYear;
        case 'monthly':
          return labels.periodMonth;
        case 'weekly':
          return labels.periodWeek;
        default:
          return period;
      }
    },
    [labels]
  );

  // Calculate yearly savings compared to monthly
  const getYearlySavingsPercent = useCallback(
    (yearlyPackage: {
      packageId: string;
      product?: { price: number };
    }): number | undefined => {
      if (!yearlyPackage.product) return undefined;

      // Find monthly equivalent by naming convention (replace _yearly with _monthly)
      const monthlyPackageId = yearlyPackage.packageId.replace(
        '_yearly',
        '_monthly'
      );
      const monthlyPkg = packages.find(p => p.packageId === monthlyPackageId);
      if (!monthlyPkg?.product) return undefined;

      const yearlyPrice = yearlyPackage.product.price;
      const monthlyPrice = monthlyPkg.product.price;

      if (monthlyPrice <= 0 || yearlyPrice <= 0) return undefined;

      const annualizedMonthly = monthlyPrice * 12;
      const savings =
        ((annualizedMonthly - yearlyPrice) / annualizedMonthly) * 100;

      return Math.round(savings);
    },
    [packages]
  );

  // Build period options for segmented control
  const billingPeriodOptions = useMemo(() => {
    return periods.map(period => ({
      value: period,
      label:
        period === 'monthly' ? labels.billingMonthly : labels.billingYearly,
    }));
  }, [periods, labels]);

  // Determine if a package is the current plan
  const isCurrentPlan = useCallback(
    (packageId: string, productId?: string): boolean => {
      if (!isAuthenticated) return false;
      if (!hasActiveSubscription) return false;
      return (
        productId === currentProductIdentifier ||
        packageId === currentProductIdentifier
      );
    },
    [isAuthenticated, hasActiveSubscription, currentProductIdentifier]
  );

  // Determine if a package is subscribable (enabled)
  const isPackageEnabled = useCallback(
    (packageId: string): boolean => {
      // Non-authenticated users can see all plans
      if (!isAuthenticated) return true;

      // If still loading or no data, enable all as fallback
      if (subscribableLoading || subscribablePackageIds.length === 0)
        return true;

      // Use subscription_lib hook results
      return subscribablePackageIds.includes(packageId);
    },
    [isAuthenticated, subscribableLoading, subscribablePackageIds]
  );

  // Determine if a package can be upgraded to
  const canUpgradeTo = useCallback(
    (packageId: string, productId?: string): boolean => {
      return (
        isPackageEnabled(packageId) && !isCurrentPlan(packageId, productId)
      );
    },
    [isPackageEnabled, isCurrentPlan]
  );

  // Separate free tier from paid packages
  const freeTierPackage = packages.find(p => !p.product);
  const paidPackages = packages.filter(p => p.product);

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
        {/* Billing Period Selector - only show if multiple periods available */}
        {periods.length > 1 && (
          <div className='flex justify-center mb-8'>
            <SegmentedControl
              options={billingPeriodOptions}
              value={selectedPeriod}
              onChange={handleBillingPeriodChange}
            />
          </div>
        )}

        {/* Loading state */}
        {isLoading && (
          <div className='flex items-center justify-center py-12'>
            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600' />
          </div>
        )}

        {/* Error state */}
        {error && !isLoading && (
          <div className='text-center py-12 text-red-500'>{error.message}</div>
        )}

        {/* Subscription Tiles Grid */}
        {!isLoading && !error && (
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
            {freeTierPackage && (
              <SubscriptionTile
                id='free'
                title={labels.freeTierTitle}
                price={labels.freeTierPrice}
                periodLabel={labels.periodMonth}
                features={labels.freeTierFeatures}
                isSelected={false}
                isCurrentPlan={isAuthenticated && !hasActiveSubscription}
                onSelect={() => {}}
                enabled={isPackageEnabled('free')}
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
            )}

            {/* Paid Plans */}
            {paidPackages.map(pkg => {
              const isCurrent = isCurrentPlan(
                pkg.packageId,
                pkg.product?.productId
              );
              const isEnabled = isPackageEnabled(pkg.packageId);
              const canUpgrade = canUpgradeTo(
                pkg.packageId,
                pkg.product?.productId
              );

              // Determine CTA button
              let ctaButton: { label: string; onClick: () => void } | undefined;
              if (!isAuthenticated) {
                // Not logged in: show "Log in to Continue"
                ctaButton = {
                  label: labels.ctaLogIn,
                  onClick: () => handlePlanClick(pkg.packageId, 'login'),
                };
              } else if (isCurrent) {
                // Current plan: no CTA
                ctaButton = undefined;
              } else if (canUpgrade) {
                // Enabled and not current: show "Upgrade"
                ctaButton = {
                  label: labels.ctaUpgrade,
                  onClick: () => handlePlanClick(pkg.packageId, 'upgrade'),
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
              } else if (pkg.packageId.includes('pro')) {
                topBadge = {
                  text: labels.mostPopularBadge,
                  color: 'yellow',
                };
              }

              return (
                <SubscriptionTile
                  key={pkg.packageId}
                  id={pkg.packageId}
                  title={pkg.name}
                  price={pkg.product?.priceString ?? '$0'}
                  periodLabel={getPeriodLabel(pkg.product?.period ?? 'monthly')}
                  features={formatters.getProductFeatures(pkg.packageId)}
                  isSelected={false}
                  isCurrentPlan={isCurrent}
                  onSelect={() => {}}
                  enabled={isEnabled}
                  isBestValue={pkg.packageId.includes('pro')}
                  topBadge={topBadge}
                  discountBadge={
                    selectedPeriod === 'yearly'
                      ? (() => {
                          const savings = getYearlySavingsPercent(pkg);
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
        )}
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
