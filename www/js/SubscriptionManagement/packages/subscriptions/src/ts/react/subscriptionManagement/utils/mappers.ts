import type { Subscription, PaymentProfileCardInfo } from '@rbx/client-subscriptions-api/v1';
import { PaymentProviderCardInfo } from '../../../core/types/cardInfo';
import { Price } from '../../../core/types/price';
import { UserSubscription } from '../../../core/types/userSubscription';
import { PeriodType, PurchasePlatform } from '../../../core/types/subscriptionEnums';
import { normalizeSubscriptionPaymentProvider } from '../../../core/utils/normalizeSubscriptionPaymentProvider';

const TARGET_KEY_PREFIX: Record<string, string> = {
  Blackbird: 'RBP',
  // Public-facing alias used in deep-link URLs (e.g. ?type=RobloxPlus).
  RobloxPlus: 'RBP',
  CurrencySubscription: 'CUR',
  DeveloperSubscription: 'EXP',
  Premium: 'PRM'
};

/**
 * Converts a product type and ID to a subscription target key (e.g. "Blackbird", "123" -> "RBP-123").
 * Returns null if the product type is not recognized.
 */
export const toTargetKey = (productType: string, productId: string): string | null => {
  const prefix = TARGET_KEY_PREFIX[productType];
  return prefix ? `${prefix}-${productId}` : null;
};

/**
 * Converts V2 card info format to existing frontend format.
 * V2 backend: lastFourDigits, expirationMonth, expirationYear
 * Frontend: last4Digits, expMonth, expYear
 */
const mapCardInfo = (cardInfo: PaymentProfileCardInfo | null | undefined): PaymentProviderCardInfo | undefined => {
  if (!cardInfo) return undefined;
  return {
    cardNetwork: cardInfo.cardNetwork,
    last4Digits: cardInfo.lastFourDigits,
    expMonth: cardInfo.expirationMonth,
    expYear: cardInfo.expirationYear
  };
};

const mapV2DisplayPrice = (displayPrice: Subscription['displayPrice']): Price => {
  if (displayPrice == null) {
    throw new Error('mapV2ToUserSubscription: displayPrice is required');
  }
  const units = displayPrice.units ?? 0;
  const nanos = displayPrice.nanos ?? 0;
  const currencyCode = displayPrice.currencyCode ?? '';
  return {
    amount: units + nanos / 1e9,
    currencyCode
  };
};

/**
 * Maps a V2 subscription response to the UserSubscription type.
 * Used for Roblox-owned subscriptions (Blackbird, CurrencySubscription) fetched via ListSubscriptions V2.
 * Display name and description are translated at the UI layer via translate().
 */
export const mapV2ToUserSubscription = (sub: Subscription): UserSubscription => {
  const productType = sub.productKey?.type ?? '';
  const productId = sub.productKey?.id ?? '';
  return {
    subscriptionTargetKey: toTargetKey(productType, productId) ?? '',
    name: productType,
    subscriptionProviderName: 'Roblox',
    productType: productType || undefined,
    price: mapV2DisplayPrice(sub.displayPrice),
    subscriptionPeriod: sub.periodType as PeriodType,
    periodCount: sub.productInfo?.periodCount,
    expiration: new Date(sub.expirationTimestampMs),
    renewal: sub.nextRenewalTimestampMs ? new Date(sub.nextRenewalTimestampMs) : new Date(0),
    paymentProvider: normalizeSubscriptionPaymentProvider(sub.paymentProvider),
    cardInfo: mapCardInfo(sub.paymentProfile?.cardInfo),
    paymentProfileId: sub.paymentProfile?.id ?? '',
    purchasePlatform: sub.purchasePlatform as PurchasePlatform,
    subscriptionOffers: sub.activeOffers?.length ? sub.activeOffers : undefined,
    currencySubscriptionBenefit:
      sub.productTypeMembershipDetails?.robloxSubscriptionMembershipDetails?.currencySubscriptionBenefit ?? null
  };
};

export default { mapV2ToUserSubscription };
