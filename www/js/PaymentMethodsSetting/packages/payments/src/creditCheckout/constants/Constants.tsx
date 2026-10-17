const paymentMethodPage = "/upgrades/paymentmethods";

enum PaymentMethod {
  RobloxCredit = "robloxCredit",
  RedeemCard = "redeemCard",
  Credit = "credit",
}

const translations = {
  orderSummaryLabel: {
    key: "Header.OrderSummary",
    default: "Order Summary",
  },
  AvailableCreditLabel: {
    key: "Label.AvailableCredit",
    default: "Available Credit",
  },
  remainingBalanceLabel: {
    key: "Label.RemainingBalance",
    default: "Remaining Balance",
  },
  taxLabel: {
    key: "Label.Tax",
    default: "Tax",
  },
  taxInfoTooltip: {
    key: "Description.TaxInfoTooltip",
    default: "Tax is determined by billing information",
  },
  calculatingTaxLabel: {
    key: "Label.CalculatingTax",
    default: "Calculating tax",
  },
  purchaseDisclosureDescription: {
    key: "Description.LegalAgreementOnCreditBalanceCheckoutWithTax",
  },
  calculateTaxErrorDescription: {
    key: "Description.CalculateTaxError",
    default: "Calculating tax error",
  },
};

export const COUNTER_METRICS = {
  GET_PRODUCT_INFO_FAILED: "GetProductInfoFailed",
  PREPARE_PAYMENT_REQUEST_FAILED: "PreparePaymentRequestFailed",
  PREPARE_PAYMENT_REQUEST_FLOOD_CHECKED: "PreparePaymentRequestFloodChecked",
  PREPARE_PAYMENT_REQUEST_REDIRECTED: "PreparePaymentRequestRedirected",
  PREPARE_PAYMENT_REQUEST_FAILED_UNEXPECTED: "PreparePaymentRequestFailedUnexpected",
  PROCESS_PAYMENT_REQUEST_FAILED: "CreditProcessPaymentRequestFailed",
  PROCESS_PAYMENT_REQUEST_REDIRECTED: "CreditProcessPaymentRequestRedirected",
  PROCESS_PAYMENT_REQUEST_UNSUCCESSFUL: "CreditProcessPaymentRequestUnsuccessful",
  PROCESS_PAYMENT_REQUEST_UNEXPECTED: "CreditProcessPaymentRequestUnexpected",
  PROCESS_PAYMENT_REQUEST_FAILED_UNEXPECTED: "CreditProcessPaymentRequestFailedUnexpected",
  GET_BILLING_EMAIL_REQUEST_FAILED_UNEXPECTED: "GetDefaultPaymentAccountEmailFailedUnexpected",
};

export const emailRegex = "^\\w+([-+.]\\w+)*@\\w+([-.]\\w+)*\\.\\w+([-.]\\w+)*$";

export const BILLING_EMAIL_TYPE_USER_SPECIFIED_EMAIL = "UserSpecifiedEmail";

export default {
  paymentMethodPage,
  PaymentMethod,
  translations,
};
