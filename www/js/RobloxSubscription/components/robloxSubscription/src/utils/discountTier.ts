import type {
  RobloxSubscriptionProductFeatureConfig,
  SubscriptionTenureDiscount,
} from "@rbx/client-subscriptions-api/v1";

export type ResolvedDiscountTier = {
  current: SubscriptionTenureDiscount | null;
  next: SubscriptionTenureDiscount | null;
};

/**
 * Resolve the user's effective virtual-transaction discount tier on a product.
 *
 * - Matched: `userVirtualTransactionDiscountTierId` matches a tier on this
 *   product → that tier is `current`.
 * - Mismatched: tier id is set but absent from this product (user is on a
 *   different Plus sub) → fall back to the product's highest configured tier
 *   so the UI still reflects the best benefit the product offers.
 * - Empty: tier id is missing → infer `current` from `currentPeriodIndex`.
 *
 * `next` is the lowest-periodIndex tier above `current`, or null at max.
 */
export function resolveDiscountTier(
  featureConfig: RobloxSubscriptionProductFeatureConfig,
  userVirtualTransactionDiscountTierId: string | undefined,
  currentPeriodIndex: number,
): ResolvedDiscountTier {
  const tiers = featureConfig.virtualTransactionDiscounts;

  let current: SubscriptionTenureDiscount | null;
  if (userVirtualTransactionDiscountTierId) {
    current =
      tiers?.find(d => d.tierId === userVirtualTransactionDiscountTierId) ??
      tiers?.toSorted((a, b) => b.periodIndex - a.periodIndex)[0] ??
      null;
  } else {
    current =
      tiers
        ?.filter(d => d.periodIndex <= currentPeriodIndex)
        .toSorted((a, b) => b.periodIndex - a.periodIndex)[0] ?? null;
  }

  const referencePeriodIndex = current?.periodIndex ?? currentPeriodIndex;
  const next =
    tiers
      ?.filter(d => d.periodIndex > referencePeriodIndex)
      .toSorted((a, b) => a.periodIndex - b.periodIndex)[0] ?? null;

  return { current, next };
}
