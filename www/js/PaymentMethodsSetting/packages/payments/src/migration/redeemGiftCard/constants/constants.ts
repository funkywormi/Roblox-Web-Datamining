export const TRANSLATION_KEYS = {
  AvailableCreditLabel: 'Label.AvailableCreditWithColon',
  BalanceDueLabel: 'Label.BalanceDue',
  CreditAfterTransaction: 'Label.CreditAfterTransaction',
  RemainingBalance: 'Label.RemainingBalance',
  ConvertibleCredit: 'Label.ConvertibleCredit',

  LargeCreditBalanceTooltipMessage: 'Message.LargeCreditBalanceTooltip',

  GetRobuxAction: 'Action.GetRobux',
  GetPremiumAction: 'ActionsGetPremium', // From CommonUI.Features
  ConvertCreditToRobuxAction: 'Label.ConvertCreditSuccess',

  BuyAction: 'Action.Buy',
  CancelAction: 'Action.Cancel',
  ConvertToRobuxAction: 'Action.ConvertToRobux',

  ConvertCreditToRobuxModalHeading: 'Label.ConvertCreditSuccess',
  BuyRobuxWithCreditModalHeading: 'Heading.BuyRobuxWithCredit',
  ConvertCreditToRobuxHeading: 'Heading.ConvertCreditToRobux',
  LargestPackageYouCanBuyStep1Message: 'Message.Step1LargestAvailablePackageYouCanBuy',
  NextLargestPackageStep2Message: 'Message.Step2NextLargestPackage',
  ConvertToRobuxStep3Message: 'Message.Step3ConvertRobux',
  ConvertCreditToRobuxMessage: 'Message.ConvertCreditToRobux',
  ConvertCreditToRobuxMessageTwentyFivePercentMore: 'Message.ConvertCreditToRobux25PercentMore',
  ConvertCreditToRobuxMessageTwentyFivePercentMoreStandalone: 'Message.25PercentMoreRobuxConvert',

  RobuxPackagePurchasedSuccessAlert: 'Alert.RobuxPackagePurchased',
  RobuxPackagePurchasedFailedAlert: 'Alert.RobuxPackagePurchaseFailed',
  ConvertedCreditToRobuxSuccessAlert: 'Alert.SuccessfullyConvertedCreditToRobux',
  ConvertedCreditToRobuxFailedAlert: 'Heading.CreditConversionFail',
  GenericFailureAlert: 'Alert.GenericFailure',

  CreditConversionHeading: 'Heading.CreditConversion',
  CreditConversionDesription: 'Description.CreditConversion',
  CodeValueLabel: 'Label.CodeValue',
  ConversionLabel: 'Label.Conversion',
  ContinueAction: `Action.Continue`,
  CodeNotYetRedeemedHeading: 'Heading.CodeNotYetRedeemed',
  CodeNotYetRedeemedMessage: 'Message.CodeNotYetRedeemed',
  OkAction: 'Action.Ok',
  CreditConversionConfirmation: 'Message.CreditConversionConfirmation',
  CalculatingTax: 'Message.CalculatingTax',
  OrderSummaryLabel: 'Header.OrderSummary',
  RobuxPurchasedLabel: 'Message.RobuxPurchased',
  IncludesUpToTwentyFivePercentMoreRobuxLabel: 'Message.IncludesUpToTwentyFivePercentMoreRobux',
  EnjoyUpToTwentyFivePercentMoreRobuxLabel: 'Message.EnjoyUpToTwentyFivePercentMoreRobux'
};

export const PREMIUM_PAGE_PATH = '/premium/membership';

export const CREDIT_PAYMENT_PROVIDER_TYPE = 'Credit';

export const CodedExceptionInvalidProduct = 2;

export const giftCardTermsURL = 'http://www.roblox.com/giftcardterms';

export const COUNTER_METRICS = {
  GET_NEXT_PURCHASABLE_FAILED_STATUS_CODE_PREFIX:
    'NewCreditConversionGetNextPurchasableFailedStatusCode',
  GET_NEXT_PURCHASABLE_CREDIT_BALANCE_ZERO:
    'NewCreditConversionGetNextPurchasableCreditBalanceZero',
  GET_NEXT_PURCHASABLE_UNEXPECTED_EXCEPTION:
    'NewCreditConversionGetNextPurchasableUnexpectedException',
  GET_NEXT_PURCHASABLE_CONVERSION: 'NewCreditConversionGetNextPurchasableConversion',
  GET_NEXT_PURCHASABLE_PRODUCT_PURCHASE: 'NewCreditConversionGetNextPurchasableProductPurchase',
  PROCESS_PAYMENT_FAILED_STATUS_CODE_PREFIX: 'ProcessPaymentRequestFailedStatusCode',
  PROCESS_PAYMENT_NEXT_STEP: 'ProcessPaymentNextStep',
  PROCESS_PAYMENT_NOT_SUCCESSFUL_PREFIX: 'ProcessPaymentNotSuccessful',
  PROCESS_PAYMENT_RESPONSE_MESSAGE_PREFIX: 'ProcessPaymentNotSuccessful',
  PROCESS_PAYMENT_UNEXPECTED_EXCEPTION: 'ProcessPaymentUnexpectedException',
  PROCESS_PAYMENT_ECONOMIC_RESTRICTION: 'ProcessPaymentEconomicRestriction',
  GO_TO_PREMIUM: 'GoToPremium',
  CONVERSION_CANCEL_CLICKED: 'ConversionCancelClicked',
  PRODUCT_PURCHASE_CANCEL_CLICKED: 'ProductPurchaseCancelClicked',
  GET_NEXT_PURCHASABLE_METADATA_FAILED_PREFIX: 'GetNextPurchasableMetadataFailed',
  GET_CONVERSION_METADATA_FAILED_PREFIX: 'GetConversionMetadataFailed',
  CREDIT_CONVERSION_CONTINUE_CLICKED: 'CreditConversionContinueClicked',
  CREDIT_CONVERSION_CANCEL_CLICKED: 'CreditConversionCancelClick',
  CREDIT_CONVERSION_SWITCHED_TO_PRODUCT_PURCHASE: 'CreditConversionSwitchedToProductPurchase',
  CREDIT_CONVERSION_PRODUCT_SWITCH_FAILED: 'CreditConversionProductSwitchFailed',
  UPDATE_ADDRESS_FAILED_STATUS_CODE_PREFIX: 'UpdateAddressFailedStatusCode'
};

export const SYSTEM_FEEDBACK_CONFIG = {
  TIMEOUT_SHOW_MS: 200,
  TIMEOUT_HIDE_MS: 5000
} as const;

export const LOW_COGS_ROBUX_PACKAGE_MAP: { [key: number]: number } = {
  500: 400,
  1000: 800,
  2000: 1700,
  5250: 4500,
  11000: 10000,
  24000: 22500,
  // Premium
  550: 440,
  1100: 880,
  2200: 1870,
  5800: 4950,
  12100: 11000,
  26400: 25000
};
