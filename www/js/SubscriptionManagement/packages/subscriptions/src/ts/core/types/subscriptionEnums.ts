// Indicates whether an item is a subscription or a private server
export enum SubscriptionListItemType {
  SUBSCRIPTION = 'Subscription',
  PRIVATE_SERVER = 'PrivateServer'
}

// Subscription period in between renewals.
export enum PeriodType {
  INVALID = 'Invalid',
  MONTH = 'Month',
  YEAR = 'Year'
}

// Device platforms for purchasing subscriptions.
export enum PurchasePlatform {
  INVALID = 'Invalid',
  DESKTOP = 'Desktop',
  APPLE = 'Apple',
  GOOGLE = 'Google',
  INTERNAL = 'Internal'
}

// Subscription product type but used by api calls.
export enum SubscriptionProductType {
  INVALID = 0,
  DEVELOPER_SUBSCRIPTION_PRODUCT = 1
}

// To decipher the error codes sent back by the subscriptions api
export enum SubscriptionErrorCodes {
  INVALID = 0,
  UNKNOWN = 1,
  INVALID_PRODUCT = 2,
  PRODUCT_NOT_FOR_SALE = 3,
  USER_ALREADY_SUBSCRIBED = 4,
  SAVED_CC_REQUIRED = 5,
  VPC_REQUIRED = 6,
  VPC_PENDING_APPROVAL = 7,
  INVALID_INPUT = 8,
  PURCHASE_PLATFORM_NOT_SUPPORTED = 9,
  INVALID_SALE_LOCATION = 10,
  USER_HAS_SPEND_LIMIT_SET = 11,
  RESTRICTED_USER = 12,
  UNSUPPORTED_LOCALE = 13,
  UNAUTHORIZED = 14,
  EXCEED_PARENTAL_SPEND_LIMIT = 15
}

export enum PaymentProvider {
  INVALID = 'Invalid',
  STRIPE = 'Stripe',
  APPLEAPPSTORE = 'AppleAppStore',
  GOOGLEPLAYSTORE = 'GooglePlayStore',
  CREDITBALANCE = 'CreditBalance',
  BRAINTREE = 'Braintree'
}

export enum PollingStatus {
  CANCEL = 'cancel',
  RESUBSCRIBE = 'resubscribe'
}
