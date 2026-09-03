import type { AxiosResponse } from 'axios';
import { httpService } from 'core-utilities';
import { EnvironmentUrls } from 'Roblox';
import { upsellUtil, paymentFlowAnalyticsService } from 'core-roblox-utilities';
import { PaymentSession } from '../../core/paymentSessionService';
import { Address } from '../../billingAddressForm/constants/TypeDefinitions';
import type { GrantedAssetListItem } from '../../robuxUpsell/components/PersonalizedBonusItemBanner';

export type GetDefaultPaymentAccountEmailResponse = {
  maskedBillingEmail: string;
  billingEmailType: string;
  disableEditBillingEmail: boolean;
};

export type PreparePaymentResponse = {
  isSuccess: boolean;
  failureReason: string | null;
  paymentMethod: string;
  productName?: string;
  productId: number;
  checkoutSessionId: number;
  robloxManagedTax: boolean;
  hasBillingAddress: boolean;
  taxRate?: number;
  selectedProduct: {
    name: string;
    isRenewable: boolean;
    renewOrExpireDate: string;
    priceText: string;
    price: number;
    currencyCode: string;
    defaultDisplayName?: string;
    translationKey?: string;
    isEligibleForBonuses?: boolean;
    grantedAssetListItems: GrantedAssetListItem[];
  };
  providerPayload: {
    redirectionPath: string;
    redirectionParams: string;
    AvailableCreditBalance: number;
    CheckoutSessionToken: string;
    CurrencyCode: string;
    TaxAmount?: number;
    TotalDue: number;
    TaxInclusive: boolean;
  };
};

export type UpdateAddressForCheckoutSessionResponse = {
  taxRate?: number;
  providerPayload: {
    AvailableCreditBalance: number;
    CheckoutSessionToken: string;
    CurrencyCode: string;
    TaxAmount?: number;
    TotalDue: number;
    TaxInclusive: boolean;
    RobuxConversionAmount?: number;
    StrikethroughRobuxConversionAmount?: number;
  };
};

export type ProcessPaymentResponse = {
  providerPayload: {
    RedirectionUrl: string;
    IsSuccessful: boolean;
    ResponseMessage: string;
  };
};

type ProcessPaymentRequestBody = {
  paymentProviderType: string;
  providerPayload: {
    productId: number;
    upsellUuid?: string;
    upsellItemPath?: string;
    checkoutSessionToken: string;
  };
  paymentSessionId?: string;
  checkoutSessionId?: number;
  billingEmailType?: string;
  billingEmail?: string;
};

export type GetConversionMetadata = {
  isConvertAllFlowEnabled: boolean;
  creditBalance: number;
};

const getDefaultPaymentAccountEmailUrlConfig = () => ({
  withCredentials: true,
  url: `${EnvironmentUrls.apiGatewayUrl}/payments-gateway/v1/default-payment-account-email-masked`
});

const preparePaymentConfig = () => ({
  withCredentials: true,
  url: `${EnvironmentUrls.apiGatewayUrl}/payments-gateway/v1/prepare-payment`
});

const updateAddressForCheckoutSessionConfig = () => ({
  withCredentials: true,
  url: `${EnvironmentUrls.apiGatewayUrl}/payments-gateway/v1/update-address-for-checkout-session`
});

const processPaymentUrlConfig = () => ({
  withCredentials: true,
  url: `${EnvironmentUrls.apiGatewayUrl}/payments-gateway/v1/process-payment`
});

const getConversionMetadataUrlConfig = () => ({
  withCredentials: true,
  url: `${EnvironmentUrls.apiGatewayUrl}/credit-balance/v1/get-conversion-metadata`
});

export const getDefaultPaymentAccountEmail = (): Promise<
  AxiosResponse<GetDefaultPaymentAccountEmailResponse>
> => {
  const urlConfig = getDefaultPaymentAccountEmailUrlConfig();
  return httpService.get(urlConfig);
};

export const preparePayment = async (
  productId: number,
  paymentMethod: string,
  paymentSession?: PaymentSession,
  address?: Address
): Promise<AxiosResponse<PreparePaymentResponse>> => {
  const urlConfig = preparePaymentConfig();

  const requestBody = {
    paymentMethod,
    productId,
    paymentSessionId: paymentSession?.id,
    paymentFlowId: paymentFlowAnalyticsService.getPaymentFlowUuid(),
    address
  };

  return httpService.post(urlConfig, requestBody);
};

export const updateAddressForCheckoutSession = async (
  address: Address,
  checkoutSessionId: number
): Promise<AxiosResponse<UpdateAddressForCheckoutSessionResponse>> => {
  const urlConfig = updateAddressForCheckoutSessionConfig();
  const requestBody = {
    checkoutSessionId,
    address
  };

  return httpService.post(urlConfig, requestBody);
};

export const processPayment = (
  productId: number,
  billingEmailAddress: string,
  billingEmailType: string,
  checkoutSessionToken: string,
  paymentSessionId?: string,
  checkoutSessionId?: number
): Promise<AxiosResponse<ProcessPaymentResponse>> => {
  const cookieData = upsellUtil.parseUpsellCookie();
  const providerPayload = {
    product_id: productId,
    upsellUuid: cookieData.upsellUuid,
    upsellItemPath: cookieData.targetItemUrl,
    checkoutSessionToken
  };

  const body: ProcessPaymentRequestBody = {
    paymentProviderType: 'Credit',
    providerPayload: {
      ...providerPayload,
      productId
    },
    paymentSessionId,
    checkoutSessionId,
    ...(billingEmailType !== '' && {
      billingEmailType,
      billingEmail: billingEmailAddress
    })
  };

  const urlConfig = processPaymentUrlConfig();
  return httpService.post(urlConfig, body);
};

export const getConversionMetadata = async (): Promise<AxiosResponse<GetConversionMetadata>> => {
  const urlConfig = getConversionMetadataUrlConfig();
  return httpService.get<GetConversionMetadata>(urlConfig);
};

export const sendPreparePaymentStatusEvent = (
  success: boolean | true,
  viewMessage: string | undefined,
  robloxManagedTax?: boolean,
  taxRateAvailable?: boolean
): void => {
  let purchaseStatus = success
    ? paymentFlowAnalyticsService.ENUM_PURCHASE_STATUS.PASSED_PREPARE_PAYMENT_REQUEST
    : paymentFlowAnalyticsService.ENUM_PURCHASE_STATUS.FAILED_PREPARE_PAYMENT_REQUEST;
  if (taxRateAvailable) {
    purchaseStatus =
      paymentFlowAnalyticsService.ENUM_PURCHASE_STATUS.PASSED_PREPARE_PAYMENT_REQUEST_WITH_TAX;
  }

  let viewName;
  if (success) {
    viewName = robloxManagedTax
      ? paymentFlowAnalyticsService.ENUM_VIEW_NAME.ROBLOX_CREDIT_CHECKOUT_WITH_TAX
      : paymentFlowAnalyticsService.ENUM_VIEW_NAME.ROBLOX_CREDIT_CHECKOUT_WITHOUT_TAX;
  } else {
    viewName = paymentFlowAnalyticsService.ENUM_VIEW_NAME.ROBLOX_CREDIT_CHECKOUT;
  }

  paymentFlowAnalyticsService.sendUserPurchaseStatusEvent(
    paymentFlowAnalyticsService.ENUM_TRIGGERING_CONTEXT.WEB_ROBUX_PURCHASE,
    purchaseStatus,
    viewMessage,
    viewName
  );
};

export const sendUpdateAddressForCheckoutSessionStatusEvent = (success: boolean | true): void => {
  paymentFlowAnalyticsService.sendUserPurchaseStatusEvent(
    paymentFlowAnalyticsService.ENUM_TRIGGERING_CONTEXT.WEB_ROBUX_PURCHASE,
    success
      ? paymentFlowAnalyticsService.ENUM_PURCHASE_STATUS.PASSED_UPDATE_ADDRESS_FOR_CHECKOUT_SESSION
      : paymentFlowAnalyticsService.ENUM_PURCHASE_STATUS.FAILED_UPDATE_ADDRESS_FOR_CHECKOUT_SESSION,
    undefined,
    paymentFlowAnalyticsService.ENUM_VIEW_NAME.ROBLOX_CREDIT_CHECKOUT_WITH_TAX
  );
};

export const sendProcessPaymentStatusEvent = (success: boolean | true): void => {
  paymentFlowAnalyticsService.sendUserPurchaseStatusEvent(
    paymentFlowAnalyticsService.ENUM_TRIGGERING_CONTEXT.WEB_ROBUX_PURCHASE,
    success
      ? paymentFlowAnalyticsService.ENUM_PURCHASE_STATUS.PASSED_PROCESS_PAYMENT
      : paymentFlowAnalyticsService.ENUM_PURCHASE_STATUS.FAILED_PROCESS_PAYMENT,
    undefined,
    paymentFlowAnalyticsService.ENUM_VIEW_NAME.ROBLOX_CREDIT_CHECKOUT_WITH_TAX
  );
};
