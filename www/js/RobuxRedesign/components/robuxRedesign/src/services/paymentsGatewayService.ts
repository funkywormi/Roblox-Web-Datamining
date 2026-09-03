import { EnvironmentUrls } from "@rbx/environment-urls";
import { APICall, HTTPVerb, withApiEvents } from "../utils/apiEventsCounter";

/**
 * Base interface for payment profile provider payloads.
 * All provider payloads have a paymentProfileType discriminant set by the backend.
 */
export interface BaseProviderPayload {
  paymentProfileType: string;
}

/**
 * Card payment profile provider payload (Stripe).
 */
export interface Card extends BaseProviderPayload {
  CardNetwork: string;
  Last4Digits: string;
  ExpMonth: number;
  ExpYear: number;
}

/**
 * PayPal payment profile provider payload (Braintree).
 */
export interface PayPal extends BaseProviderPayload {
  Email?: string;
  BillingAddress?: string;
}

/**
 * Union type of all payment profile provider payloads.
 * Add new payment providers here (e.g., GooglePay, ApplePay).
 */
export type PaymentProfileProviderPayload = Card | PayPal;

export interface PaymentProfile {
  id: string;
  providerPayload: PaymentProfileProviderPayload;
  lastChargeTime: number;
  // TODO: Remove backwards compatibility check after isQuickPayEnabled is fully rolled out.
  // Once fully rolled out, this field should be required and we should filter strictly.
  isQuickPayEnabled?: boolean;
}

export enum UserPurchaseSettingFailureReason {
  FraudPaymentAuthorizationAttempt = "FraudPaymentAuthorizationAttempt",
  FraudVirtualEconomyAbuse = "FraudVirtualEconomyAbuse",
  FraudAbuseOfAffiliateSystem = "FraudAbuseOfAffiliateSystem",
  FraudAttemptedUnauthorizedPaymentMethodUse = "FraudAttemptedUnauthorizedPaymentMethodUse",
  FraudRepeatedRefundRequests = "FraudRepeatedRefundRequests",
  FraudSuspiciousRefundRequests = "FraudSuspiciousRefundRequests",
  FraudUnauthorizedPurchase = "FraudUnauthorizedPurchase",
  FraudUseOfUnauthorizedOffPlatformTransactions = "FraudUseOfUnauthorizedOffPlatformTransactions",
  FraudUseOfUnauthorizedPaymentMethod = "FraudUseOfUnauthorizedPaymentMethod",
  FraudSuspiciousAccountPatterns = "FraudSuspiciousAccountPatterns",
  FraudChargeback = "FraudChargeback",
  None = "None",
  PurchaseNotEnabled = "PurchaseNotEnabled",
  SpendLimitExceeded = "SpendLimitExceeded",
}

// don't trust CheckUserPurchaseSettingsResponse.cs, expirationTimeInMinutes
// definitely can be present on the response - see EconomicFeatureAccessGrpcInterceptor.cs
// for where it gets inserted
export type CheckUserPurchaseSettingResponse = {
  expirationTimeInMinutes: number | undefined;
  failureReason: UserPurchaseSettingFailureReason;
  isEligible: boolean;
};

export enum QuickPayFlowType {
  BuyRobuxPage = "BuyRobuxPage",
  BuyRobuxPagePreselectedProduct = "BuyRobuxPagePreselectedProduct",
}

export type GetQuickPayMetadataResponse = {
  isUserEligible: boolean;
  legalDisclosureTranslationKey: string;
};

export type GetPaymentProfilesResponse = PaymentProfile[];

export enum StripeTaxType {
  INVALID = "Invalid",
  AMUSEMENT_TAX = "AmusementTax",
  COMMUNICATIONS_TAX = "CommunicationsTax",
  GST = "Gst",
  HST = "Hst",
  IGST = "Igst",
  JCT = "Jct",
  LEASE_TAX = "LeaseTax",
  PST = "Pst",
  QST = "Qst",
  RST = "Rst",
  SALES_TAX = "SalesTax",
  VAT = "Vat",
  SUMMED = "Summed",
  SERVICE_TAX = "ServiceTax",
  UNKNOWN = "Unknown",
}

export type Money = {
  CurrencyCode: string;
  Nanos: number;
  Units: number;
};

export type PreparePaymentProviderPayload = {
  amountTotal: Money;
  billingCountryCode: string;
  redirectionPath: string;
  taxAmountExclusive: Money;
  taxCalculationId: string;
  taxPercentageDecimal: string;
  taxType?: StripeTaxType;
};

export type DisplayProduct = {
  name: string;
  isRenewable: boolean;
  renewOrExpireDate: string;
  priceText: string;
  price: number;
  currencyCode: string;
  defaultDisplayName?: string;
  translationKey?: string;
};

export type PreparePaymentResponse = {
  isSuccess: boolean;
  failureReason?: string;
  paymentMethod: string;
  selectedProduct: DisplayProduct;
  providerPayload?: PreparePaymentProviderPayload;
  checkoutSessionId: number;
};

export enum StripeErrorCode {
  INCORRECT_CVC = "incorrect_cvc",
  CARD_DECLINED = "card_declined",
  EXPIRED_CARD = "expired_card",
  INSUFFICIENT_FUNDS = "insufficient_funds",
  BALANCE_INSUFFICIENT = "balance_insufficient",
}

export type ProcessPaymentBaseProviderPayload = {
  StripeErrorCode?: StripeErrorCode;
};

export type ProcessPaymentPaypalProviderPayload = ProcessPaymentBaseProviderPayload & {
  RedirectionUrl?: string; // PayPal uses this field
};

export type ProcessPaymentStripeProviderPayload = ProcessPaymentBaseProviderPayload & {
  redirectToUrl?: string; // Stripe uses this field
};

export type ProcessPaymentProviderPayload =
  | ProcessPaymentPaypalProviderPayload
  | ProcessPaymentStripeProviderPayload;

export type ProcessPaymentResponse = {
  isSuccess: boolean;
  providerPayload: ProcessPaymentProviderPayload;
};

export const checkUserPurchaseSetting = async (): Promise<
  CheckUserPurchaseSettingResponse | undefined
> =>
  withApiEvents<CheckUserPurchaseSettingResponse>(
    HTTPVerb.POST,
    APICall.CHECK_USER_PURCHASE_SETTING,
    {
      url: `${EnvironmentUrls.apiGatewayUrl}/payments-gateway/v1/check-user-purchase-settings`,
      withCredentials: true,
    },
    {}, // required
  );

export const getQuickPayMetadata = async (
  quickPayFlowType: QuickPayFlowType,
): Promise<GetQuickPayMetadataResponse | undefined> =>
  withApiEvents<GetQuickPayMetadataResponse>(
    HTTPVerb.GET,
    APICall.GET_QUICK_PAY_METADATA,
    {
      url: `${EnvironmentUrls.apiGatewayUrl}/payments-gateway/v1/get-quick-pay-metadata`,
      withCredentials: true,
    },
    {
      quickPayFlowType,
    },
  );

export const getPaymentProfiles = async (): Promise<GetPaymentProfilesResponse | undefined> =>
  withApiEvents<GetPaymentProfilesResponse>(HTTPVerb.GET, APICall.GET_PAYMENT_PROFILES, {
    url: `${EnvironmentUrls.apiGatewayUrl}/payments-gateway/v1/payment-profiles`,
    withCredentials: true,
  });

export const preparePayment = async (
  paymentFlowId: string,
  paymentMethod: string,
  paymentSessionId: string,
  productId: string,
  quickPaySelectedPaymentProfileId: string,
): Promise<PreparePaymentResponse | undefined> =>
  withApiEvents<PreparePaymentResponse>(
    HTTPVerb.POST,
    APICall.PREPARE_PAYMENT,
    {
      url: `${EnvironmentUrls.apiGatewayUrl}/payments-gateway/v1/prepare-payment`,
      withCredentials: true,
    },
    {
      isQuickPay: true,
      paymentFlowId,
      paymentMethod,
      paymentSessionId,
      productId,
      quickPaySelectedPaymentProfileId,
    },
    undefined,
    true,
  );

export type ProcessPaymentRequest = {
  paymentProviderType: string;
  providerPayload: PreparePaymentProviderPayload;
  checkoutSessionId?: number;
  paymentSessionId?: string;
  quickPaySelectedPaymentProfileId?: string;
};

export const processPayment = async (
  request: ProcessPaymentRequest,
): Promise<ProcessPaymentResponse | undefined> =>
  withApiEvents<ProcessPaymentResponse>(
    HTTPVerb.POST,
    APICall.PROCESS_PAYMENT,
    {
      url: `${EnvironmentUrls.apiGatewayUrl}/payments-gateway/v1/process-payment`,
      withCredentials: true,
    },
    request,
  );
