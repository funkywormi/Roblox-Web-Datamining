import {
  ProductType,
  Money,
  PaymentMethod,
  PaymentProvider,
  PeriodType,
  SubscriptionProductTypeDetails,
} from "@rbx/client-subscriptions-api/v1";

export const SubscriptionContext = "subscription";
export const ROBLOX_PLUS_TARGET_KEY_PREFIX = "RBP-";

export const getRobloxPlusProductIdFromTargetKey = (
  subscriptionTargetKey: string | undefined,
): string | undefined =>
  subscriptionTargetKey?.startsWith(ROBLOX_PLUS_TARGET_KEY_PREFIX)
    ? subscriptionTargetKey.slice(ROBLOX_PLUS_TARGET_KEY_PREFIX.length)
    : subscriptionTargetKey;

const PRODUCT_TYPE_MAP: Record<string, ProductType> = {
  [ProductType.Blackbird.toLowerCase()]: ProductType.Blackbird,
  robloxplus: ProductType.Blackbird,
  [ProductType.CurrencySubscription.toLowerCase()]: ProductType.CurrencySubscription,
};

const RENEWAL_PERIOD_TYPE_MAP: Record<PeriodType, string> = {
  [PeriodType.Week]: "Weekly",
  [PeriodType.Month]: "Monthly",
  [PeriodType.Year]: "Yearly",
};

const RENEWAL_PERIOD_TRANSLATION_KEY_MAP: Record<string, string> = {
  [PeriodType.Week]: "Label.DurationTitleWeekly",
  [PeriodType.Month]: "Label.DurationTitle",
  [PeriodType.Year]: "Label.DurationTitleYearly",
};

const PAYMENT_METHOD_MAP: Record<string, PaymentMethod> = {
  [PaymentMethod.CreditAndDebitCard.toLowerCase()]: PaymentMethod.CreditAndDebitCard,
  [PaymentMethod.Paypal.toLowerCase()]: PaymentMethod.Paypal,
  [PaymentMethod.Venmo.toLowerCase()]: PaymentMethod.Venmo,
};

const PAYMENT_METHOD_TO_PROVIDER_MAP: Record<PaymentMethod, PaymentProvider> = {
  [PaymentMethod.CreditAndDebitCard]: PaymentProvider.Stripe,
  [PaymentMethod.Paypal]: PaymentProvider.Braintree,
  [PaymentMethod.Venmo]: PaymentProvider.Braintree,
  [PaymentMethod.RobloxCredit]: PaymentProvider.CreditBalance,
};

const lastDayOfMonth = (year: number, monthZeroBased: number): number =>
  new Date(Date.UTC(year, monthZeroBased + 1, 0)).getUTCDate();

const addMonthsPreservingDayOfMonth = (base: Date, months: number): Date => {
  const targetMonth = base.getUTCMonth() + months;
  const targetYear = base.getUTCFullYear() + Math.floor(targetMonth / 12);
  const normalizedMonth = ((targetMonth % 12) + 12) % 12;
  const targetDay = Math.min(base.getUTCDate(), lastDayOfMonth(targetYear, normalizedMonth));

  return new Date(
    Date.UTC(
      targetYear,
      normalizedMonth,
      targetDay,
      base.getUTCHours(),
      base.getUTCMinutes(),
      base.getUTCSeconds(),
      base.getUTCMilliseconds(),
    ),
  );
};

const addYearsPreservingDayOfMonth = (base: Date, years: number): Date => {
  const targetYear = base.getUTCFullYear() + years;
  const targetMonth = base.getUTCMonth();
  const targetDay = Math.min(base.getUTCDate(), lastDayOfMonth(targetYear, targetMonth));

  return new Date(
    Date.UTC(
      targetYear,
      targetMonth,
      targetDay,
      base.getUTCHours(),
      base.getUTCMinutes(),
      base.getUTCSeconds(),
      base.getUTCMilliseconds(),
    ),
  );
};

/**
 * Converts a product type string to the ProductType enum.
 * @param productType - The product type string from URL query params
 * @returns The corresponding ProductType enum value or undefined if no mapping exists
 */
export function getSubscriptionProductType(productType: string): ProductType | undefined {
  return PRODUCT_TYPE_MAP[productType.toLowerCase()];
}

/**
 * Converts a PeriodType to a renewal period type string.
 *
 * @param periodType - The period type from the subscription product
 * @returns The renewal period type string (e.g., "Monthly", "Yearly"), or undefined if no mapping exists
 */
export function getRenewalPeriodType(periodType: PeriodType): string | undefined {
  return RENEWAL_PERIOD_TYPE_MAP[periodType];
}

/**
 * Gets the translation key for a renewal period type.
 *
 * @param renewalPeriodType - The renewal period type (e.g., "Weekly", "Monthly", "Yearly")
 * @returns The translation key string, or empty string if no mapping exists
 */
export function getRenewalPeriodTranslationKey(periodType: PeriodType): string {
  return RENEWAL_PERIOD_TRANSLATION_KEY_MAP[periodType] ?? "";
}

/**
 * Converts a Money object with units and nanos to a numeric price value.
 * This handles the protobuf Money format where the price is split into
 * whole units and nano-units (billionths).
 *
 * @param money - The Money object containing units and nanos
 * @returns The combined price as a number
 */
export function getPrice(money: Money): number {
  return money.units + money.nanos / 1e9;
}

/**
 * Adds a subscription billing period using UTC date math and clamps month/year
 * rollover to the target month's last day.
 */
export function addBillingPeriod(
  baseTimestampMs: number,
  periodCount: number,
  periodType: PeriodType,
): Date {
  const date = new Date(baseTimestampMs);

  switch (periodType) {
    case PeriodType.Week:
      date.setUTCDate(date.getUTCDate() + 7 * periodCount);
      return date;
    case PeriodType.Month:
      return addMonthsPreservingDayOfMonth(date, periodCount);
    case PeriodType.Year:
      return addYearsPreservingDayOfMonth(date, periodCount);
    default:
      throw new Error(`Unsupported period type: ${periodType as PeriodType}`);
  }
}

/**
 * Returns the Foundation icon name for a subscription product type, if one exists.
 *
 * @param subscriptionProductType - The product type enum value
 * @returns The Foundation icon name string, or undefined for product types without a custom icon
 */
export function getSubscriptionIcon(subscriptionProductType: ProductType): string | undefined {
  switch (subscriptionProductType) {
    case ProductType.Blackbird:
      return "icon-regular-roblox-plus";
    default:
      return undefined;
  }
}

/**
 * Gets the default display name for a subscription product based on its type.
 *
 * For Blackbird (Roblox Plus) products, a configured `currencySubscriptionConfig`
 * with a positive `entitledAmountMicros` indicates a bundle SKU (Plus + recurring
 * Robux allowance). Bundles render as "Roblox Plus {allowance}" so users can
 * tell a bundle apart from the standalone Plus subscription on the payment page.
 *
 * @param subscriptionProductType - The product type enum value
 * @param subscriptionProductTypeDetails - The product type details from the API
 * @param renewalPeriodLabel - The translated renewal period label (e.g. "Monthly", "Yearly")
 * @returns The formatted display name string
 */
export function getDefaultDisplayName(
  subscriptionProductType: ProductType,
  subscriptionProductTypeDetails: SubscriptionProductTypeDetails,
  renewalPeriodLabel: string,
): string {
  switch (subscriptionProductType) {
    case ProductType.CurrencySubscription: {
      const details = subscriptionProductTypeDetails.currencySubscriptionProductDetails;
      if (!details) {
        // TODO SUBS-4097: Add error handling and metrics for subscription purchases
        return "";
      }
      const amount = details.entitledAmountMicros / 1_000_000;
      return `${amount} ${details.currencyType} ${renewalPeriodLabel}`;
    }
    case ProductType.Blackbird: {
      const featureConfig =
        subscriptionProductTypeDetails.robloxSubscriptionProductDetails?.featureConfig;
      const bundleAllowanceMicros =
        featureConfig?.currencySubscriptionConfig?.entitledAmountMicros ?? 0;
      if (bundleAllowanceMicros > 0) {
        const robuxAllowance = Math.floor(bundleAllowanceMicros / 1_000_000);
        return `Plus ${robuxAllowance}`;
      }
      return "Roblox Plus";
    }
    default:
      // TODO SUBS-4097: Add error handling and metrics for subscription purchases
      return "";
  }
}

/**
 * Converts a payment method string to the corresponding PaymentMethod enum.
 *
 * @param paymentMethodString - The payment method string (e.g., 'CreditAndDebitCard', 'Paypal')
 * @returns The corresponding PaymentMethod enum value, or undefined if no mapping exists
 */
export function getPaymentMethod(
  paymentMethodString: string | null | undefined,
): PaymentMethod | undefined {
  return PAYMENT_METHOD_MAP[paymentMethodString?.toLowerCase() ?? ""];
}

/**
 * Converts a PaymentMethod enum to the corresponding PaymentProvider enum.
 *
 * @param paymentMethod - The PaymentMethod enum value
 * @returns The corresponding PaymentProvider enum value, or undefined if no mapping exists
 */
export function paymentMethodToPaymentProvider(
  paymentMethod: PaymentMethod,
): PaymentProvider | undefined {
  return PAYMENT_METHOD_TO_PROVIDER_MAP[paymentMethod];
}
