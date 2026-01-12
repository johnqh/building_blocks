/**
 * @fileoverview App Subscriptions Page
 * @description Page for managing app subscriptions and viewing rate limits
 */

import { useState, useEffect, useCallback } from 'react';
import {
  SubscriptionLayout,
  SubscriptionTile,
  SegmentedControl,
} from '@sudobility/subscription-components';
import type { RateLimitsConfigData } from '@sudobility/types';
import type { AnalyticsTrackingParams } from '../../types';

type BillingPeriod = 'monthly' | 'yearly';

/** Product from subscription provider */
export interface SubscriptionProduct {
  identifier: string;
  title: string;
  price: string;
  priceString: string;
  period?: string;
  freeTrialPeriod?: string;
  introPrice?: string;
}

/** Current subscription state */
export interface CurrentSubscription {
  isActive: boolean;
  productIdentifier?: string;
  expirationDate?: Date;
  willRenew?: boolean;
}

/** Subscription context value passed from consumer */
export interface SubscriptionContextValue {
  products: SubscriptionProduct[];
  currentSubscription: CurrentSubscription | null;
  isLoading: boolean;
  error: string | null;
  /** Purchase a subscription product. subscriptionUserId identifies which user/entity the subscription is for. */
  purchase: (
    productId: string,
    subscriptionUserId?: string
  ) => Promise<boolean>;
  /** Restore purchases. subscriptionUserId identifies which user/entity to restore for. */
  restore: (subscriptionUserId?: string) => Promise<boolean>;
  clearError: () => void;
}

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
  /** Get features for a product by its identifier (required - same as pricing page) */
  getProductFeatures: (productId: string) => string[];
}

/** Package ID to entitlement mapping (same as PricingPage) */
export interface EntitlementMap {
  [packageId: string]: string;
}

/** Entitlement to level mapping for comparing plan tiers (same as PricingPage) */
export interface EntitlementLevels {
  [entitlement: string]: number;
}

export interface AppSubscriptionsPageProps {
  /** Subscription context value */
  subscription: SubscriptionContextValue;
  /** Rate limit configuration (for displaying current usage, not for features) */
  rateLimitsConfig?: RateLimitsConfigData | null;
  /** User ID used for subscription (the selected entity's ID when logged in) */
  subscriptionUserId?: string;
  /** All localized labels */
  labels: SubscriptionPageLabels;
  /** Formatter functions for dynamic strings */
  formatters: SubscriptionPageFormatters;
  /** Package ID to entitlement mapping (same as PricingPage) */
  entitlementMap: EntitlementMap;
  /** Entitlement to level mapping for comparing tiers (same as PricingPage) */
  entitlementLevels: EntitlementLevels;
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
 * Uses the same entitlement mapping and features display as AppPricingPage.
 */
export function AppSubscriptionsPage({
  subscription,
  rateLimitsConfig,
  subscriptionUserId,
  labels,
  formatters,
  entitlementMap,
  entitlementLevels: _entitlementLevels,
  onPurchaseSuccess,
  onRestoreSuccess,
  onError,
  onWarning,
  onTrack,
}: AppSubscriptionsPageProps) {
  const {
    products,
    currentSubscription,
    isLoading,
    error,
    purchase,
    restore,
    clearError,
  } = subscription;

  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>('monthly');
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

  // Show error via callback
  useEffect(() => {
    if (error) {
      onError?.(labels.errorTitle, error);
      clearError();
    }
  }, [error, clearError, labels.errorTitle, onError]);

  // Filter products by billing period and sort by price
  const filteredProducts = products
    .filter(product => {
      if (!product.period) return false;
      const isYearly =
        product.period.includes('Y') || product.period.includes('year');
      return billingPeriod === 'yearly' ? isYearly : !isYearly;
    })
    .sort((a, b) => parseFloat(a.price) - parseFloat(b.price));

  const handlePeriodChange = useCallback(
    (period: BillingPeriod) => {
      setBillingPeriod(period);
      setSelectedPlan(null);
      track('billing_period_changed', { billing_period: period });
    },
    [track]
  );

  const handlePurchase = useCallback(async () => {
    if (!selectedPlan) return;

    setIsPurchasing(true);
    clearError();
    track('purchase_initiated', { plan_identifier: selectedPlan });

    try {
      const result = await purchase(selectedPlan, subscriptionUserId);
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
    clearError,
    track,
    purchase,
    subscriptionUserId,
    onPurchaseSuccess,
    labels.errorTitle,
    labels.purchaseError,
    onError,
  ]);

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

  const handleRestore = useCallback(async () => {
    setIsRestoring(true);
    clearError();
    track('restore_initiated');

    try {
      const result = await restore(subscriptionUserId);
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
    clearError,
    track,
    restore,
    subscriptionUserId,
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

  const getTrialLabel = useCallback(
    (trialPeriod?: string) => {
      if (!trialPeriod) return undefined;
      const num = parseInt(trialPeriod.replace(/\D/g, '') || '1', 10);
      if (trialPeriod.includes('W')) {
        return formatters.formatTrialWeeks(num);
      }
      if (trialPeriod.includes('M')) {
        return formatters.formatTrialMonths(num);
      }
      return formatters.formatTrialDays(num);
    },
    [formatters]
  );

  const formatRateLimit = useCallback(
    (limit: number | null): string => {
      if (limit === null) return labels.unlimited;
      return limit.toLocaleString();
    },
    [labels.unlimited]
  );

  // Use formatters.getProductFeatures directly (same as AppPricingPage)
  const getProductFeatures = useCallback(
    (packageId: string): string[] => {
      return formatters.getProductFeatures(packageId);
    },
    [formatters]
  );

  // Free tier features come from labels (same as AppPricingPage)
  const getFreeTierFeatures = useCallback((): string[] => {
    return labels.freeTierFeatures;
  }, [labels.freeTierFeatures]);

  const getYearlySavingsPercent = useCallback(
    (yearlyPackageId: string): number | undefined => {
      const yearlyEntitlement = entitlementMap[yearlyPackageId];
      if (!yearlyEntitlement) return undefined;

      const yearlyProduct = products.find(
        p => p.identifier === yearlyPackageId
      );
      if (!yearlyProduct) return undefined;

      const monthlyPackageId = Object.entries(entitlementMap).find(
        ([pkgId, ent]) => ent === yearlyEntitlement && pkgId.includes('monthly')
      )?.[0];
      if (!monthlyPackageId) return undefined;

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
    [products, entitlementMap]
  );

  const billingPeriodOptions = [
    { value: 'monthly' as const, label: labels.billingMonthly },
    { value: 'yearly' as const, label: labels.billingYearly },
  ];

  return (
    <SubscriptionLayout
      title={labels.title}
      error={error}
      currentStatusLabel={labels.currentStatusLabel}
      currentStatus={{
        isActive: currentSubscription?.isActive ?? false,
        activeContent: currentSubscription?.isActive
          ? {
              title: labels.statusActive,
              fields: [
                {
                  label: labels.labelPlan,
                  value:
                    currentSubscription.productIdentifier ||
                    labels.labelPremium,
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
        !isLoading && products.length > 0 ? (
          <div className='flex justify-center mb-6'>
            <SegmentedControl
              options={billingPeriodOptions}
              value={billingPeriod}
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
      ) : products.length === 0 ? (
        <div className='text-center py-12 text-theme-text-secondary'>
          {labels.noProducts}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className='text-center py-12 text-theme-text-secondary'>
          {labels.noProductsForPeriod}
        </div>
      ) : (
        <>
          {/* Free tier tile */}
          <SubscriptionTile
            key='free'
            id='free'
            title={labels.freeTierTitle}
            price={labels.freeTierPrice}
            periodLabel={labels.periodMonth}
            features={getFreeTierFeatures()}
            isSelected={!currentSubscription?.isActive && selectedPlan === null}
            onSelect={() => handlePlanSelect(null)}
            topBadge={
              !currentSubscription?.isActive
                ? {
                    text: labels.currentPlanBadge,
                    color: 'green',
                  }
                : undefined
            }
            disabled={isPurchasing || isRestoring}
            hideSelectionIndicator
          />
          {/* Paid plans */}
          {filteredProducts.map(product => (
            <SubscriptionTile
              key={product.identifier}
              id={product.identifier}
              title={product.title}
              price={product.priceString}
              periodLabel={getPeriodLabel(product.period)}
              features={getProductFeatures(product.identifier)}
              isSelected={selectedPlan === product.identifier}
              onSelect={() => handlePlanSelect(product.identifier)}
              isBestValue={product.identifier.includes('pro')}
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
              introPriceNote={
                product.freeTrialPeriod
                  ? getTrialLabel(product.freeTrialPeriod)
                  : product.introPrice
                    ? formatters.formatIntroNote(product.introPrice)
                    : undefined
              }
              disabled={isPurchasing || isRestoring}
            />
          ))}
        </>
      )}
    </SubscriptionLayout>
  );
}
