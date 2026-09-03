import { urlService } from 'core-utilities';

export const ANDROID_CANCEL_RENEWAL_URL = 'https://play.google.com/store/account/subscriptions';

// TODO (jkohn) remove ap=0 when www (website) is released Apr 24
export const CREDIT_CHECKOUT_URL = urlService.getAbsoluteUrl(
  `/upgrades/redeem?ap=0&subscriptionTargetKey=`
);

export const buildCreditCheckoutUrl = (subscriptionTargetKey: string): string =>
  `${CREDIT_CHECKOUT_URL}${subscriptionTargetKey}`;

export const CHECKOUT_SUCCESS_URL = urlService.getAbsoluteUrl(`/upgrades/checkout/success`);

export const APP_STORE_CANCEL_HELP_URL = 'https://help.roblox.com/hc/articles/360029312472';

export const GIFTCARD_REDEEM_URL = urlService.getAbsoluteUrl(`/redeem`);

export const GIFTCARD_PURCHASE_URL = urlService.getAbsoluteUrl(`/giftcards`);

export const BILLING_SETTING_URL = urlService.getAbsoluteUrl('/my/account#!/billing');
