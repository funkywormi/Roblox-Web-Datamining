import { SubscriptionErrorCodes } from '../types/subscriptionEnums';

export const FeatureSubscriptions = {
  HeadingSubscriptions: 'Heading.Subscriptions',
  LabelPerMonth: 'Text.PerMonth',
  ActionReportSubscription: 'Action.ReportSubscription',
  HeadingGetSubscription: 'Heading.GetSubscription',
  ActionSubscribe: 'Action.Subscribe',
  ActionSubscribeWithRobloxCredit: 'Action.SubscribeWithRobloxCredit',
  ActionSubscribeWithCreditDebitCard: 'Action.SubscribeWithCreditDebitCard',
  ActionSubscribePayAnotherWay: 'Action.SubscribePayAnotherWay',
  MessageMonthlyCadenceDisclaimer: 'Text.DisclaimerMonthly',
  MessageRecurringMonthlyDisclaimer: 'Text.DisclaimerRecurMonthly',
  MessageNoSubscriptionsAvailable: 'Message.NoSubscriptionsAvailable',
  LabelSubscribed: 'Text.Subscribed',
  HeadingAddPaymentMethod: 'Heading.AddPaymentMethod',
  MessageStripeEmailInputSubText: 'Message.StripeEmailInputSubText',
  MessageStripeAddPaymentMethodDisclosure: 'Message.StripeAddPaymentMethodDisclosure',
  ErrorStripeCardDeclined: 'Error.StripeCardDeclined',
  ErrorStripeCardExpired: 'Error.StripeCardExpired',
  ErrorStripeIncorrectCVC: 'Error.StripeIncorrectCVC',
  ErrorStripeSaveCardGeneralError: 'Error.StripeSaveCardGeneralError',
  ErrorGenericError: 'Error.GenericError',
  ErrorStripeSavedCardSomethingWentWrong: 'Error.StripeSavedCardSomethingWentWrong',
  HeadingStripeFormAddPaymentMethod: 'Heading.StripeFormAddPaymentMethodNote',
  HeadingBillingEmail: 'Heading.BillingEmail',
  HeadingBillingAddress: 'Heading.BillingAddress',
  HeadingParentPermissionNeeded: 'Heading.ParentPermissionNeeded',
  MessageParentPermissionVPC: 'Message.ParentPermissionVPC',
  ActionParentOrGuardian: 'Action.ParentOrGuardian',
  HeadingCannotSubscribe: 'Heading.CannotSubscribe',
  MessageMonthlySpendRestrictionsSubscriptionUnavailable:
    'Message.MonthlySpendRestrictions.SubscriptionUnavailable',
  MessageMonthlySpendLimitExceed: 'Message.MonthlySpendRestrictionsMonthlyLimitExceed',
  MessageSubscriptionNotAvailableInCountry: 'Message.SubscriptionNotAvailableInCountry',
  MessageSubscriptionNotAvailableAgeRestriction: 'Message.SubscriptionNotAvailableExperienceOver17',
  MessageCannotPlayInExperience: 'Message.CannotPlayInExperience',
  ErrorParentalRestriction: 'Error.ParentalRestriction',
  MessageReportSubmitted: 'Message.ReportSubmitted',
  ActionSeeMore: 'Action.SeeMore',
  ActionReport: 'Action.Report',
  ActionShare: 'Action.Share',
  MessageLinkCopied: 'Message.LinkCopied'
};

export const CommonVerifiedParentalConsent = {
  LabelAskParent: 'Label.AskParent',
  DescriptionSpendingRestrictionWithSettings: 'Description.SpendingRestrictionWithSettings',
  ActionGoToSettings: 'Action.GoToSettings',
  ActionCancel: 'Action.Cancel'
};

// A lot of these errors are generic errors as they are not expected to be reached on web
// as a modal display error
export const SubscriptionErrorCodesToModalContent: {
  [key in SubscriptionErrorCodes]?: string;
} = {
  [SubscriptionErrorCodes.INVALID]: FeatureSubscriptions.ErrorGenericError,
  [SubscriptionErrorCodes.INVALID_INPUT]: FeatureSubscriptions.ErrorGenericError,
  [SubscriptionErrorCodes.INVALID_PRODUCT]: FeatureSubscriptions.ErrorGenericError,
  [SubscriptionErrorCodes.INVALID_SALE_LOCATION]: FeatureSubscriptions.ErrorGenericError,
  [SubscriptionErrorCodes.PURCHASE_PLATFORM_NOT_SUPPORTED]: FeatureSubscriptions.ErrorGenericError,
  [SubscriptionErrorCodes.RESTRICTED_USER]: FeatureSubscriptions.MessageCannotPlayInExperience,
  [SubscriptionErrorCodes.SAVED_CC_REQUIRED]: FeatureSubscriptions.ErrorGenericError,
  [SubscriptionErrorCodes.UNKNOWN]: FeatureSubscriptions.ErrorGenericError,
  [SubscriptionErrorCodes.UNSUPPORTED_LOCALE]:
    FeatureSubscriptions.MessageSubscriptionNotAvailableInCountry,
  [SubscriptionErrorCodes.USER_ALREADY_SUBSCRIBED]: FeatureSubscriptions.ErrorGenericError,
  [SubscriptionErrorCodes.USER_HAS_SPEND_LIMIT_SET]:
    FeatureSubscriptions.MessageMonthlySpendRestrictionsSubscriptionUnavailable,
  [SubscriptionErrorCodes.EXCEED_PARENTAL_SPEND_LIMIT]:
    FeatureSubscriptions.MessageMonthlySpendLimitExceed,
  [SubscriptionErrorCodes.VPC_PENDING_APPROVAL]: FeatureSubscriptions.ErrorGenericError,
  [SubscriptionErrorCodes.VPC_REQUIRED]: FeatureSubscriptions.MessageParentPermissionVPC
};

export default {
  FeatureSubscriptions
};
