// API Keys for getting stripePromise for rendering Stripe iframe
import { EnvironmentUrls } from 'Roblox';
import { urlService } from 'core-utilities';

const DEV_PUBLIC_KEY =
  'pk_test_51LNOeQHDRNiW7vlLcKH8TGCpJ7zhaidLdSegE22GCuvQbVUX2xDiGJY6WYaldYyo6qgVxmy1SnSVpSdaqyjfqclU00NQwWntIe';
const STAGING_PUBLIC_KEY =
  'pk_test_51LNM0XG5RADBkfjhYJlpADA2ArzWIh7gTWTodYNbpEzSiT55dul3VJhaBIVHL0CNyO0gECOz1vPnWArAkjwQ8NBO00Cdf2PxED';
const PROD_PUBLIC_KEY =
  'pk_live_51LKpO9C8tJWGhK4HEHtny9Dg7xXiQJ1i349cq6KBDusbl8bRHO7QmCKKhX18LPjSirMNTvj3tesq6mhIQuPioeAd0062ZCgoF3';

export const PLATFORM_TYPE: { [key: string]: string } = {
  isAndroidApp: 'isAndroidApp',
  isAmazonApp: 'isAmazonApp',
  isIosApp: 'isIosApp',
  isUwpApp: 'isUwpApp',
  isXboxApp: 'isXboxApp',
  isUniversalApp: 'isUniversalApp',
  isDesktop: 'isDesktop'
};
export const ANDROID_CANCEL_RENEWAL_URL = 'https://play.google.com/store/account/subscriptions';

export type TApiError = {
  data: any;
  status: number;
};

export const getStripePublicAPIKeyForEnv = (): string => {
  if (EnvironmentUrls.websiteUrl.includes('sitetest1')) return STAGING_PUBLIC_KEY;
  if (EnvironmentUrls.websiteUrl.includes('sitetest3')) return DEV_PUBLIC_KEY;
  return PROD_PUBLIC_KEY;
};

export const getPaymentMethodsSettingTabUrl = (): string => {
  return urlService.getAbsoluteUrl(`/my/account#!/billing`);
};

export const getSubscriptionPageUrl = (): string => {
  return urlService.getAbsoluteUrl(`/premium/membership`);
};

export const getCancelSubscriptionPageUrl = (): string => {
  return urlService.getAbsoluteUrl(`/upgrades/cancel-subscription`);
};

export const getStripeFormOptions = (clientSecret: string) => {
  return {
    clientSecret,
    wallets: {
      applePay: 'never',
      googlePay: 'never'
    },
    appearance: {
      theme: document.body.classList.contains('dark-theme') ? 'night' : 'stripe',
      labels: 'above'
    }
  };
};

const paymentMethodClassNameMapping: { [key: string]: string } = {
  visa: 'visa',
  mastercard: 'masterCard',
  amex: 'americanExpress',
  americanexpress: 'americanExpress',
  discover: 'discover',
  debitcard: 'debitCard',
  redeemcard: 'redeemCard',
  robloxcredit: 'robloxCredit',
  xsollakoreadebitcard: 'xsollaKoreaDebitCard',
  paypal: 'paypal',
  appleappstore: 'appleAppStore',
  googleplaystore: 'googlePlayStore',
  xsollaamazonpay: 'xsollaAmazonPay',
  xboxstore: 'xboxStore',
  xsolla: 'xsolla',
  xsollaoxxo: 'xsollaOxxo',
  xsollaboleto: 'xsollaBoleto',
  xsollapix: 'xsollaPix',
  xsollaother: 'xsollaOther',
  cartes_bancaires: 'debitCard',
  diners: 'debitCard',
  jcb: 'debitCard',
  unionpay: 'debitCard'
};

export const getPaymentMethodClassNameMapping = (paymentMethod: string): string => {
  const className = paymentMethodClassNameMapping[paymentMethod.trim().toLowerCase()];
  if (!className) {
    // TODO: Add counter
    return paymentMethod.toLowerCase();
  }
  return className;
};

export const enum errorCodeMapping {
  RemovePaymentProfileNotAllowedFailure = 'RemovePaymentProfileNotAllowedFailure'
}

export const COUNTER_METRICS = {
  SAVED_PAYMENT_METHODS: {
    ADD_CARD_CLICKED: 'AddCardClicked',
    CANCEL_ADD_CLICKED: 'CancelAddCardInModalClicked',
    SUBMIT_ADD_CLICKED: 'AddCardSubmitInModalClicked',
    DELETE_CARD_CLICKED: 'DeleteSavedPaymentMethodButtonClicked',
    IN_MODAL_ABORT_CARD_DELETION: 'CancelCardDeletionInModalButtonClicked',
    IN_MODAL_ABORT_CARD_UPDATE: 'CancelCardUpdateInModalButtonClicked',
    UPDATE_CARD_CLICKED: 'UpdateCardClicked',
    IN_MODAL_CARD_DELETION: 'DeleteCardInModalButtonClicked',
    IN_MODAL_CARD_UPDATE: 'UpdateCardInModalButtonClicked',
    STRIPE_EMAIL_EXISTS: 'StripeCustomerEmailAlreadyExists',
    STRIPE_EMAIL_DOES_NOT_EXIST: 'StripeCustomerEmailDoesNotExist'
  },
  ROBLOX_CREDIT: {
    CONVERT_CREDIT_CLICKED: 'ConvertCreditToRobuxButtonClicked',
    IN_MODAL_CONVERT_CLICKED: 'ConvertCreditToRobuxInModalButtonClicked',
    IN_MODAL_CONVERT_CREDIT_CANCEL: 'ConvertCreditToRobuxCancelInModalButtonClicked'
  },
  SUBSCRIPTIONS: {
    NO_EXISTING_SUBSCRIPTION: 'UserHasNoSubscription',
    SUBSCRIBE_CLICKED: 'SubscribeButtonClicked',
    CANCEL_CLICKED: 'CancelSubscriptionButtonClicked',
    SUBSCRIPTION_ATTACHED_TO_CARD: 'CannotDeleteCardWithSubscriptionError'
  },
  API: {
    GET_PAYMENT_PROFILE_SETUP_CALLED: 'GetPaymentProfileSetupCalled',
    GET_PAYMENT_PROFILE_SETUP_SUCCEEDED: 'GetPaymentProfileSetupSucceeded',
    GET_PAYMENT_PROFILE_SETUP_FAILED: 'GetPaymentProfileSetupFailed',
    GET_USER_BIRTHDATE_CALLED: 'GetUserBirthdateCalled',
    GET_USER_BIRTHDATE_SUCCEEDED: 'GetUserBirthdateSucceeded',
    GET_USER_BIRTHDATE_FAILED: 'GetUserBirthdateFailed',
    GET_SAVED_PAYMENT_PROFILES_CALLED: 'GetSavedPaymentProfilesCalled',
    GET_SAVED_PAYMENT_PROFILES_SUCCEEDED: 'GetSavedPaymentProfilesSucceeded',
    GET_SAVED_PAYMENT_PROFILES_FAILED: 'GetSavedPaymentProfilesFailed',
    GET_SAVED_PAYMENT_PROFILES_RETURNS_NONE: 'GetSavedPaymentProfilesReturnsNone',
    DELETE_SAVED_PAYMENT_PROFILE_CALLED: 'DeleteSavedPaymentProfileCalled',
    DELETE_SAVED_PAYMENT_PROFILE_SUCCEEDED: 'DeleteSavedPaymentProfileSucceeded',
    DELETE_SAVED_PAYMENT_PROFILE_FAILED: 'DeleteSavedPaymentProfileFailed',
    GET_USER_PREMIUM_SUBSCRIPTION_CALLED: 'GetUserPremiumSubscriptionCalled',
    GET_USER_PREMIUM_SUBSCRIPTION_SUCCEEDED: 'GetUserPremiumSubscriptionSucceeded',
    GET_USER_PREMIUM_SUBSCRIPTION_FAILED: 'GetUserPremiumSubscriptionFailed',
    GET_EXP_VARIANT_CALLED: 'GetExperimentVariantCalled',
    GET_EXP_VARIANT_SUCCEEDED: 'GetExperimentVariantSucceeded',
    GET_EXP_VARIANT_FAILED: 'GetExperimentVariantFailed',
    CONVERT_CREDIT_TO_ROBUX_CALLED: 'ConvertCreditToRobuxCalled',
    CONVERT_CREDIT_TO_ROBUX_SUCCEEDED: 'ConvertCreditToRobuxSucceeded',
    CONVERT_CREDIT_TO_ROBUX_FAILED: 'ConvertCreditToRobuxFailed',
    GET_CREDIT_CONVERSION_METADATA_CALLED: 'GetCreditConversionMetadataCalled',
    GET_CREDIT_CONVERSION_METADATA_SUCCEEDED: 'GetCreditConversionMetadataSucceeded',
    GET_CREDIT_CONVERSION_METADATA_FAILED: 'GetCreditConversionMetadataFailed',
    GET_CREDIT_CONVERSION_METADATA_CURRENCY_CODE_NULL:
      'GetCreditConversionMetadataCurrencyCodeNull',
    VERIFY_PAYMENT_PROFILE_CALLED: 'VerifyPaymentProfileCreationCalled',
    VERIFY_PAYMENT_PROFILE_SUCCEEDED: 'VerifyPaymentProfileCreationSucceeded',
    VERIFY_PAYMENT_PROFILE_FAILED: 'VerifyPaymentProfileCreationFailed',
    UPDATE_SAVED_PAYMENT_PROFILE_CALLED: 'UpdateSavedPaymentProfileCalled',
    UPDATE_SAVED_PAYMENT_PROFILE_SUCCEEDED: 'UpdateSavedPaymentProfileSucceeded',
    UPDATE_SAVED_PAYMENT_PROFILE_FAILED: 'UpdateSavedPaymentProfileFailed'
  },
  STRIPE: {
    LOAD_STRIPE_CALLED: 'LoadStripeCalled',
    LOAD_STRIPE_SUCCEEDED: 'LoadStripeSucceeded',
    LOAD_STRIPE_FAILED: 'LoadStripeFailed',
    CONFIRM_SETUP_INTENT_CALLED: 'StripeConfirmSetupIntentCalled',
    CONFIRM_SETUP_INTENT_SUCCEEDED: 'StripeConfirmSetupIntentSucceeded',
    CONFIRM_SETUP_INTENT_FAILED: 'StripeConfirmSetupIntentFailed'
  }
};

export const STRIPE_ERROR_CODES = {
  INCORRECT_CVC: 'incorrect_cvc',
  CARD_DECLINED: 'card_declined',
  EXPIRED_CARD: 'expired_card'
};

export const AMPActionableValues = {
  Granted: 'Granted',
  Actionable: 'Actionable',
  Denied: 'Denied'
};

export const settingChangeAmpFeature = 'CanChangeSetting';
