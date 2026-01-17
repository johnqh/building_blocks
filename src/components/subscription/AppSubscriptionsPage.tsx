/**
 * @fileoverview App Subscriptions Page
 * @description Page for managing app subscriptions and viewing rate limits.
 *
 * Uses subscription_lib hooks directly for all subscription data:
 * - useSubscriptionPeriods: Get available billing periods
 * - useSubscriptionForPeriod: Get packages for selected period
 * - useSubscribable: Determine which packages are enabled
 * - useUserSubscription: Get current user's subscription
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  SubscriptionLayout,
  SubscriptionTile,
  SegmentedControl,
} from '@sudobility/subscription-components';
import {
  useSubscribable,
  useSubscriptionPeriods,
  useSubscriptionForPeriod,
  useUserSubscription,
} from '@sudobility/subscription_lib';
import type { SubscriptionPeriod } from '@sudobility/subscription_lib';
import type { RateLimitsConfigData } from '@sudobility/types';
import type { AnalyticsTrackingParams } from '../../types';

/** All localized labels for the subscription page */
export interface SubscriptionPageLabels {
  title: string;
  errorTitle: string;
  purchaseError: string;
  restoreError: string;
  restoreNoPurchases: string;

  // Periods
  periodYear: string;
  periodMonth: string;
  periodWeek: string;

  // Billing period toggle
  billingMonthly: string;
  billingYearly: string;

  // Rate limits
  unlimited: string;
  unlimitedRequests: string;

  // Current status
  currentStatusLabel: string;
  statusActive: string;
  statusInactive: string;
  statusInactiveMessage: string;
  labelPlan: string;
  labelPremium: string;
  labelExpires: string;
  labelWillRenew: string;
  labelMonthlyUsage: string;
  labelDailyUsage: string;
  yes: string;
  no: string;

  // Buttons
  buttonSubscribe: string;
  buttonPurchasing: string;
  buttonRestore: string;
  buttonRestoring: string;

  // Empty states
  noProducts: string;
  noProductsForPeriod: string;

  // Free tier
  freeTierTitle: string;
  freeTierPrice: string;
  freeTierFeatures: string[];

  // Badges
  currentPlanBadge: string;
}

/** Formatter functions for dynamic strings */
export interface SubscriptionPageFormatters {
  /** Format rate limit: "1,000 requests/hour" */
  formatHourlyLimit: (limit: string) => string;
  /** Format rate limit: "10,000 requests/day" */
  formatDailyLimit: (limit: string) => string;
  /** Format rate limit: "100,000 requests/month" */
  formatMonthlyLimit: (limit: string) => string;
  /** Format trial period: "7 days free trial" */
  formatTrialDays: (count: number) => string;
  /** Format trial period: "2 weeks free trial" */
  formatTrialWeeks: (count: number) => string;
  /** Format trial period: "1 month free trial" */
  formatTrialMonths: (count: number) => string;
  /** Format savings badge: "Save 20%" */
  formatSavePercent: (percent: number) => string;
  /** Format intro price note */
  formatIntroNote: (price: string) => string;
  /** Get features for a product by its identifier */
  getProductFeatures: (productId: string) => string[];
}

export interface AppSubscriptionsPageProps {
  /** Offer ID for subscription_lib hooks (e.g., "api", "default") */
  offerId: string;
  /** Rate limit configuration (for displaying current usage) */
  rateLimitsConfig?: RateLimitsConfigData | null;
  /** All localized labels */
  labels: SubscriptionPageLabels;
  /** Formatter functions for dynamic strings */
  formatters: SubscriptionPageFormatters;
  /** Purchase handler - called with packageId */
  onPurchase: (packageId: string) => Promise<boolean>;
  /** Restore purchases handler */
  onRestore: () => Promise<boolean>;
  /** Called when purchase succeeds */
  onPurchaseSuccess?: () => void;
  /** Called when restore succeeds */
  onRestoreSuccess?: () => void;
  /** Called on error */
  onError?: (title: string, message: string) => void;
  /** Called on warning */
  onWarning?: (title: string, message: string) => void;
  /** Optional analytics tracking callback */
  onTrack?: (params: AnalyticsTrackingParams) => void;
}

/**
 * Page for managing app subscriptions.
 * Uses subscription_lib hooks directly for all subscription data.
 */
export function AppSubscriptionsPage({
  offerId,
  rateLimitsConfig,
  labels,
  formatters,
  onPurchase,
  onRestore,
  onPurchaseSuccess,
  onRestoreSuccess,
  onError,
  onWarning,
  onTrack,
}: AppSubscriptionsPageProps) {
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

  // Get current user subscription
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

  const isLoading =
    periodsLoading ||
    packagesLoading ||
    subscribableLoading ||
    subscriptionLoading;
  const error =
    periodsError || packagesError || subscribableError || subscriptionError;

  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  // Helper to track analytics events
  const track = useCallback(
    (label: string, params?: Record<string, unknown>) => {
      onTrack?.({
        eventType: 'subscription_action',
        componentName: 'AppSubscriptionsPage',
        label,
        params,
      });
    },
    [onTrack]
  );

  // Handle billing period change with tracking
  const handlePeriodChange = useCallback(
    (value: string) => {
      const newPeriod = value as SubscriptionPeriod;
      setSelectedPeriod(newPeriod);
      setSelectedPlan(null);
      track('billing_period_changed', { billing_period: newPeriod });
    },
    [track]
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
      if (!currentSubscription?.isActive) return false;
      return (
        productId === currentSubscription.productId ||
        packageId === currentSubscription.packageId
      );
    },
    [currentSubscription]
  );

  // Determine if a package is subscribable (enabled)
  const isPackageEnabled = useCallback(
    (packageId: string): boolean => {
      // If still loading or no data, enable all as fallback
      if (subscribableLoading || subscribablePackageIds.length === 0)
        return true;
      return subscribablePackageIds.includes(packageId);
    },
    [subscribableLoading, subscribablePackageIds]
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

  // Auto-select current plan on mount and when subscription changes
  useEffect(() => {
    if (currentSubscription?.isActive && currentSubscription.packageId) {
      setSelectedPlan(currentSubscription.packageId);
      // Also set billing period to match current plan
      if (
        currentSubscription.period &&
        periods.includes(currentSubscription.period)
      ) {
        setSelectedPeriod(currentSubscription.period);
      }
    }
  }, [currentSubscription, periods]);

  const handlePlanSelect = useCallback(
    (planIdentifier: string | null) => {
      setSelectedPlan(planIdentifier);
      track('plan_selected', {
        plan_identifier: planIdentifier ?? 'free',
        is_free_tier: planIdentifier === null,
      });
    },
    [track]
  );

  const handlePurchase = useCallback(async () => {
    if (!selectedPlan) return;

    setIsPurchasing(true);
    track('purchase_initiated', { plan_identifier: selectedPlan });

    try {
      const result = await onPurchase(selectedPlan);
      if (result) {
        track('purchase_completed', { plan_identifier: selectedPlan });
        onPurchaseSuccess?.();
        setSelectedPlan(null);
      } else {
        track('purchase_failed', {
          plan_identifier: selectedPlan,
          reason: 'purchase_returned_false',
        });
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : labels.purchaseError;
      track('purchase_failed', {
        plan_identifier: selectedPlan,
        reason: errorMessage,
      });
      onError?.(labels.errorTitle, errorMessage);
    } finally {
      setIsPurchasing(false);
    }
  }, [
    selectedPlan,
    track,
    onPurchase,
    onPurchaseSuccess,
    labels.errorTitle,
    labels.purchaseError,
    onError,
  ]);

  const handleRestore = useCallback(async () => {
    setIsRestoring(true);
    track('restore_initiated');

    try {
      const result = await onRestore();
      if (result) {
        track('restore_completed');
        onRestoreSuccess?.();
      } else {
        track('restore_failed', { reason: 'no_purchases_found' });
        onWarning?.(labels.errorTitle, labels.restoreNoPurchases);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : labels.restoreError;
      track('restore_failed', { reason: errorMessage });
      onError?.(labels.errorTitle, errorMessage);
    } finally {
      setIsRestoring(false);
    }
  }, [
    track,
    onRestore,
    onRestoreSuccess,
    labels.errorTitle,
    labels.restoreNoPurchases,
    labels.restoreError,
    onWarning,
    onError,
  ]);

  const formatExpirationDate = useCallback((date?: Date) => {
    if (!date) return '';
    return new Intl.DateTimeFormat(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  }, []);

  const formatProductName = useCallback(
    (packageId?: string, productId?: string): string => {
      if (!packageId && !productId) return labels.labelPremium;

      // Try to find the package in current packages
      const pkg = packages.find(
        p => p.packageId === packageId || p.product?.productId === productId
      );
      if (pkg?.name) return pkg.name;

      // Fallback: format the identifier into a readable name
      const identifier = packageId || productId || '';
      return identifier
        .split(/[_-]/)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
    },
    [packages, labels.labelPremium]
  );

  const formatRateLimit = useCallback(
    (limit: number | null): string => {
      if (limit === null) return labels.unlimited;
      return limit.toLocaleString();
    },
    [labels.unlimited]
  );

  // Separate free tier from paid packages
  const freeTierPackage = packages.find(p => !p.product);
  const paidPackages = packages.filter(p => p.product);

  return (
    <SubscriptionLayout
      title={labels.title}
      error={error?.message}
      currentStatusLabel={labels.currentStatusLabel}
      currentStatus={{
        isActive: currentSubscription?.isActive ?? false,
        activeContent: currentSubscription?.isActive
          ? {
              title: labels.statusActive,
              fields: [
                {
                  label: labels.labelPlan,
                  value: formatProductName(
                    currentSubscription.packageId,
                    currentSubscription.productId
                  ),
                },
                {
                  label: labels.labelExpires,
                  value: formatExpirationDate(
                    currentSubscription.expirationDate
                  ),
                },
                {
                  label: labels.labelWillRenew,
                  value: currentSubscription.willRenew ? labels.yes : labels.no,
                },
                ...(rateLimitsConfig
                  ? [
                      {
                        label: labels.labelMonthlyUsage,
                        value: `${rateLimitsConfig.currentUsage.monthly.toLocaleString()} / ${formatRateLimit(rateLimitsConfig.currentLimits.monthly)}`,
                      },
                      {
                        label: labels.labelDailyUsage,
                        value: `${rateLimitsConfig.currentUsage.daily.toLocaleString()} / ${formatRateLimit(rateLimitsConfig.currentLimits.daily)}`,
                      },
                    ]
                  : []),
              ],
            }
          : undefined,
        inactiveContent: !currentSubscription?.isActive
          ? {
              title: labels.statusInactive,
              message: labels.statusInactiveMessage,
            }
          : undefined,
      }}
      aboveProducts={
        !isLoading && periods.length > 1 ? (
          <div className='flex justify-center mb-6'>
            <SegmentedControl
              options={billingPeriodOptions}
              value={selectedPeriod}
              onChange={handlePeriodChange}
            />
          </div>
        ) : null
      }
      primaryAction={{
        label: isPurchasing ? labels.buttonPurchasing : labels.buttonSubscribe,
        onClick: handlePurchase,
        disabled: !selectedPlan || isPurchasing || isRestoring,
        loading: isPurchasing,
      }}
      secondaryAction={{
        label: isRestoring ? labels.buttonRestoring : labels.buttonRestore,
        onClick: handleRestore,
        disabled: isPurchasing || isRestoring,
        loading: isRestoring,
      }}
    >
      {isLoading ? (
        <div className='flex items-center justify-center py-12'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600' />
        </div>
      ) : error ? (
        <div className='text-center py-12 text-red-500'>{error.message}</div>
      ) : packages.length === 0 ? (
        <div className='text-center py-12 text-theme-text-secondary'>
          {labels.noProducts}
        </div>
      ) : paidPackages.length === 0 ? (
        <div className='text-center py-12 text-theme-text-secondary'>
          {labels.noProductsForPeriod}
        </div>
      ) : (
        <>
          {/* Free tier tile - only show if user has no subscription */}
          {freeTierPackage && !currentSubscription?.isActive && (
            <SubscriptionTile
              key='free'
              id='free'
              title={labels.freeTierTitle}
              price={labels.freeTierPrice}
              periodLabel={labels.periodMonth}
              features={labels.freeTierFeatures}
              isSelected={selectedPlan === null}
              isCurrentPlan={!currentSubscription?.isActive}
              onSelect={() => handlePlanSelect(null)}
              enabled={isPackageEnabled('free')}
              topBadge={{
                text: labels.currentPlanBadge,
                color: 'green',
              }}
              disabled={isPurchasing || isRestoring}
              hideSelectionIndicator
            />
          )}

          {/* Paid plans */}
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
            // Can only select if it's an upgrade or it's the current plan
            const canSelect = canUpgrade || isCurrent;

            return (
              <SubscriptionTile
                key={pkg.packageId}
                id={pkg.packageId}
                title={pkg.name}
                price={pkg.product?.priceString ?? '$0'}
                periodLabel={getPeriodLabel(pkg.product?.period ?? 'monthly')}
                features={formatters.getProductFeatures(pkg.packageId)}
                isSelected={selectedPlan === pkg.packageId}
                isCurrentPlan={isCurrent}
                onSelect={() => canSelect && handlePlanSelect(pkg.packageId)}
                enabled={isEnabled}
                isBestValue={pkg.packageId.includes('pro')}
                topBadge={
                  isCurrent
                    ? {
                        text: labels.currentPlanBadge,
                        color: 'green',
                      }
                    : undefined
                }
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
                introPriceNote={
                  pkg.product?.trialPeriod
                    ? (() => {
                        const period = pkg.product?.trialPeriod;
                        if (!period) return undefined;
                        const num = parseInt(
                          period.replace(/\D/g, '') || '1',
                          10
                        );
                        if (period.includes('W'))
                          return formatters.formatTrialWeeks(num);
                        if (period.includes('M'))
                          return formatters.formatTrialMonths(num);
                        return formatters.formatTrialDays(num);
                      })()
                    : pkg.product?.introPrice
                      ? formatters.formatIntroNote(pkg.product.introPrice)
                      : undefined
                }
                disabled={isPurchasing || isRestoring || !canSelect}
              />
            );
          })}
        </>
      )}
    </SubscriptionLayout>
  );
}
