import type { SubscriptionOffer } from '@rbx/client-subscriptions-api/v1';
import { GetStripeCardIcon } from '../../../core/utils/paymentUtils';
import { PremiumPurchasePlatform } from '../../../core/types/premiumEnums';
import { PaymentProvider, PurchasePlatform } from '../../../core/types/subscriptionEnums';
import { PaymentProviderCardInfo } from '../../../core/types/cardInfo';
import { SavedPaymentProfile } from '../../../core/types/savedPaymentProfile';

export const getPaymentProfile = (
  paymentProfiles: SavedPaymentProfile[],
  expectedPaymentProfileId: string,
  expectedPaymentProfile: PaymentProviderCardInfo | undefined
): SavedPaymentProfile | undefined => {
  let paymentProfile = paymentProfiles.find(profile => profile.id === expectedPaymentProfileId);
  if (paymentProfile === undefined && expectedPaymentProfile !== undefined) {
    paymentProfile = paymentProfiles.find(
      profile =>
        profile.providerPayload.CardNetwork === expectedPaymentProfile.cardNetwork &&
        profile.providerPayload.ExpMonth === expectedPaymentProfile.expMonth &&
        profile.providerPayload.ExpYear === expectedPaymentProfile.expYear &&
        profile.providerPayload.Last4Digits === expectedPaymentProfile.last4Digits
    );

    if (paymentProfile === undefined) {
      return {
        id: 'restricted',
        providerPayload: {
          CardNetwork: expectedPaymentProfile.cardNetwork,
          ExpMonth: expectedPaymentProfile.expMonth,
          ExpYear: expectedPaymentProfile.expYear,
          Last4Digits: expectedPaymentProfile.last4Digits
        }
      };
    }
  }

  return paymentProfile;
};

export const getPaymentIconClass = (
  purchasePlatform: PurchasePlatform | PremiumPurchasePlatform,
  paymentProvider?: PaymentProvider,
  cardInfo?: PaymentProviderCardInfo
): string => {
  // Get icon for payment method
  let paymentIconClass = 'icon-generic-card';
  switch (purchasePlatform) {
    case PurchasePlatform.APPLE:
    case PremiumPurchasePlatform.IOS_APP:
      paymentIconClass = 'icon-apple';
      break;
    case PurchasePlatform.GOOGLE:
    case PremiumPurchasePlatform.ANDROID_APP:
      paymentIconClass = 'icon-google';
      break;
    case PurchasePlatform.DESKTOP:
    case PurchasePlatform.INTERNAL:
    case PremiumPurchasePlatform.DESKTOP:
      if (paymentProvider) {
        switch (paymentProvider) {
          case PaymentProvider.CREDITBALANCE:
            paymentIconClass = 'icon-roblox-credit';
            break;
          case PaymentProvider.BRAINTREE:
            // https://roblox.atlassian.net/browse/SUBS-4967
            // TODO: here we assume that a braintree payment is a paypal purchase. 
            // TODO: Technically it can be either paypal or venmo but we know that right now we only support paypal.
            paymentIconClass = 'icon-paypal';
            break;
          case PaymentProvider.STRIPE:
            if (cardInfo) {
              paymentIconClass = GetStripeCardIcon(cardInfo.cardNetwork);
            }
            break;
          default:
            paymentIconClass = 'icon-generic-card';
            break;
        }
        break;
      }
      break;
    default:
      paymentIconClass = 'icon-generic-card';
      break;
  }
  return paymentIconClass;
};

export const isExpiring = (renewal: Date, expiration: Date): boolean => {
  return renewal.getTime() === 0 || expiration <= renewal;
};

export const hasFreeTrialOffer = (offers?: SubscriptionOffer[]): boolean =>
  offers?.some(o => o.offerType === 'FreeTrial') ?? false;

export default { getPaymentProfile, getPaymentIconClass, isExpiring, hasFreeTrialOffer };
