// Currently counter metrics are only used for existing
// metrics for premium and saved credit card events.

import { ManageEventType } from '../utils/logging';

export const COUNTER_METRICS = {
  SUBSCRIPTIONS: {
    NO_EXISTING_SUBSCRIPTION: 'UserHasNoSubscription',
    // SUBSCRIBE_CLICKED: 'SubscribeButtonClicked',
    CANCEL_CLICKED: 'CancelSubscriptionButtonClicked',
    PAYMENT_FAILURE_EMAIL_DIRECT_LINK: 'PaymentFailureEmailDirectLink',
    CLICK_UPDATE_PAYMENT_METHOD: 'SubscriptionsClickUpdatePaymentMethod',
    UPDATE_PAYMENT_METHOD_SUCCESS: 'SubscriptionsUpdatePaymentMethodSuccess',
    UPDATE_PAYMENT_METHOD_FAILURE: 'SubscriptionsUpdatePaymentMethodFailure',
    UPDATE_PAYMENT_METHOD_ADD_CARD_CLICKED: 'SubscriptionsUpdatePaymentMethodAddCardClicked',
    UPDATE_PAYMENT_METHOD_ADD_CARD_SUCCESS: 'SubscriptionsUpdatePaymentMethodAddCardSuccess',
    UPDATE_PAYMENT_METHOD_ADD_CARD_FAILED: 'SubscriptionsUpdatePaymentMethodAddCardFailed',
    UPDATE_PAYMENT_METHOD_ADD_LIMITED_CARD_SUCCESS:
      'SubscriptionsUpdatePaymentMethodAddLimitedCardSuccess',
    CLICK_RESUBSCRIBE: 'SubscriptionsClickResubscribe',
    RESUBSCRIBE_SUCCESS: 'SubscriptionsResubscribeSuccess'
  },
  API: {
    GET_USER_PREMIUM_SUBSCRIPTION_CALLED: 'GetUserPremiumSubscriptionCalled',
    GET_USER_PREMIUM_SUBSCRIPTION_SUCCEEDED: 'GetUserPremiumSubscriptionSucceeded',
    GET_USER_PREMIUM_SUBSCRIPTION_FAILED: 'GetUserPremiumSubscriptionFailed',
    GET_PAYMENT_METHODS_FAILED: 'GetPaymentMethodsFailed',
    GET_SAVED_PAYMENT_PROFILES_CALLED: 'GetSavedPaymentProfilesCalled',
    GET_SAVED_PAYMENT_PROFILES_SUCCEEDED: 'GetSavedPaymentProfilesSucceeded',
    GET_SAVED_PAYMENT_PROFILES_FAILED: 'GetSavedPaymentProfilesFailed',
    GET_SAVED_PAYMENT_PROFILES_RETURNS_NONE: 'GetSavedPaymentProfilesReturnsNone',
    GET_PAYMENT_PROFILE_SETUP_CALLED: 'GetPaymentProfileSetupCalled',
    GET_PAYMENT_PROFILE_SETUP_SUCCEEDED: 'GetPaymentProfileSetupSucceeded',
    GET_PAYMENT_PROFILE_SETUP_FAILED: 'GetPaymentProfileSetupFailed',
    GET_USER_BIRTHDATE_CALLED: 'GetUserBirthdateCalled',
    GET_USER_BIRTHDATE_SUCCEEDED: 'GetUserBirthdateSucceeded',
    GET_USER_BIRTHDATE_FAILED: 'GetUserBirthdateFailed',
    DELETE_SAVED_PAYMENT_PROFILE_CALLED: 'DeleteSavedPaymentProfileCalled',
    DELETE_SAVED_PAYMENT_PROFILE_SUCCEEDED: 'DeleteSavedPaymentProfileSucceeded',
    DELETE_SAVED_PAYMENT_PROFILE_FAILED: 'DeleteSavedPaymentProfileFailed',
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
    UPDATE_SAVED_PAYMENT_PROFILE_FAILED: 'UpdateSavedPaymentProfileFailed',
    UPDATE_SUBSCRIPTION_PAYMENT_METHOD_CALLED: 'UpdateSubscriptionPaymentMethodCalled',
    UPDATE_SUBSCRIPTION_PAYMENT_METHOD_SUCCEEDED: 'UpdateSubscriptionPaymentMethodSucceeded',
    UPDATE_SUBSCRIPTION_PAYMENT_METHOD_FAILED: 'UpdateSubscriptionPaymentMethodFailed'
  },
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
    STRIPE_EMAIL_DOES_NOT_EXIST: 'StripeCustomerEmailDoesNotExist',
    UPDATE_SUBSCRIPTION_PAYMENT_METHOD_CLICKED: 'UpdateSubscriptionPaymentMethodCalled',
    EDIT_SUBSCRIPTION_PAYMENT_METHOD_CLICKED: 'EditSubscriptionPaymentMethodCalled'
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

export const ProtoEventToCounterEventMap = new Map([
  [
    ManageEventType.CLICK_UPDATE_PAYMENT_METHOD,
    COUNTER_METRICS.SUBSCRIPTIONS.CLICK_UPDATE_PAYMENT_METHOD
  ],
  [
    ManageEventType.UPDATE_PAYMENT_METHOD_SUCCESS,
    COUNTER_METRICS.SUBSCRIPTIONS.UPDATE_PAYMENT_METHOD_SUCCESS
  ],
  [
    ManageEventType.UPDATE_PAYMENT_METHOD_FAILURE,
    COUNTER_METRICS.SUBSCRIPTIONS.UPDATE_PAYMENT_METHOD_FAILURE
  ],
  [
    ManageEventType.EMAIL_REFERER_PAGE_LOAD,
    COUNTER_METRICS.SUBSCRIPTIONS.PAYMENT_FAILURE_EMAIL_DIRECT_LINK
  ],
  [
    ManageEventType.UPDATE_PAYMENT_METHOD_ADD_CARD_CLICKED,
    COUNTER_METRICS.SUBSCRIPTIONS.UPDATE_PAYMENT_METHOD_ADD_CARD_CLICKED
  ],
  [
    ManageEventType.UPDATE_PAYMENT_METHOD_ADD_CARD_SUCCESS,
    COUNTER_METRICS.SUBSCRIPTIONS.UPDATE_PAYMENT_METHOD_ADD_CARD_SUCCESS
  ],
  [
    ManageEventType.UPDATE_PAYMENT_METHOD_ADD_CARD_FAILURE,
    COUNTER_METRICS.SUBSCRIPTIONS.UPDATE_PAYMENT_METHOD_ADD_CARD_FAILED
  ],
  [ManageEventType.CLICK_RESUBSCRIBE, COUNTER_METRICS.SUBSCRIPTIONS.CLICK_RESUBSCRIBE],
  [ManageEventType.RESUBSCRIBE_SUCCESS, COUNTER_METRICS.SUBSCRIPTIONS.RESUBSCRIBE_SUCCESS]
]);
