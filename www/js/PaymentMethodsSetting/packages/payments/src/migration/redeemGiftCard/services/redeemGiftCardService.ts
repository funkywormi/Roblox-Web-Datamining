/* eslint-disable no-nested-ternary */
import type { AxiosResponse } from 'axios';
import { EnvironmentUrls, ExperimentationService } from 'Roblox';
import { httpService } from 'core-utilities';
import { paymentFlowAnalyticsService } from 'core-roblox-utilities';
import { CREDIT_PAYMENT_PROVIDER_TYPE } from '../constants/constants';
import {
  getRedeemGiftCardMetadataUrlConfig,
  redeemPaymentsGatewayConfig,
  twentyPercentMoreRobuxBrazilLayerName,
  twentyPercentMoreRobuxUKLayerName
} from '../constants/redeemGiftCardConstants';
import { TNextPurchasableMetadata, TProcessPayment } from '../constants/typeDefinitions';
import { PaymentSession } from '../../core/paymentSessionService';
import { Address } from '../../billingAddressForm/constants/TypeDefinitions';

type TGetConversionMetadata = {
  creditBalance: number;
  currencyCode: string;
  robuxConversionAmount: number;
  isConvertAllFlowEnabled: boolean;
};

export type PreparePaymentForCreditConversionResponse = {
  isSuccess: boolean;
  failureReason: string;
  checkoutSessionId: number;
  robloxManagedTax: boolean;
  hasBillingAddress: boolean;
  taxRate?: number;
  providerPayload: {
    CheckoutSessionToken: string;
    TaxAmount?: number;
    CurrencyCode: string;
    AvailableCreditBalance?: number;
    RobuxConversionAmount?: number;
    StrikethroughRobuxConversionAmount?: number;
    ResponseMessage?: string;
    IsSuccessful?: boolean;
  };
};

const getConversionMetadataUrlConfig = () => ({
  withCredentials: true,
  url: `${EnvironmentUrls.apiGatewayUrl}/credit-balance/v1/get-conversion-metadata`
});

const getNextPurchasableMetadataUrlConfig = () => ({
  withCredentials: true,
  url: `${EnvironmentUrls.apiGatewayUrl}/credit-balance/v1/next-purchasable-metadata`
});

const processPaymentUrlConfig = () => ({
  withCredentials: true,
  url: `${EnvironmentUrls.apiGatewayUrl}/payments-gateway/v1/process-payment`
});

const preparePaymentForCreditConversionUrlConfig = () => ({
  withCredentials: true,
  url: `${EnvironmentUrls.apiGatewayUrl}/payments-gateway/v1/prepare-payment-for-credit-conversion`
});

export const getNextPurchasableMetadata = async (
  address?: Address
): Promise<AxiosResponse<TNextPurchasableMetadata>> => {
  const urlConfig = getNextPurchasableMetadataUrlConfig();
  const requestBody = {
    address
  };
  return httpService.post<TNextPurchasableMetadata>(urlConfig, requestBody);
};

export const processPayment = async (
  productId: number | null | undefined
): Promise<AxiosResponse<TProcessPayment>> => {
  const productIdEmpty = !productId;
  const providerPayload = {
    product_id: productIdEmpty ? undefined : productId
  };
  const params = {
    paymentProviderType: CREDIT_PAYMENT_PROVIDER_TYPE,
    providerPayload
  };

  const urlConfig = processPaymentUrlConfig();
  return httpService.post<TProcessPayment>(urlConfig, params);
};

export const getConversionMetadata = async (): Promise<AxiosResponse<TGetConversionMetadata>> => {
  const urlConfig = getConversionMetadataUrlConfig();
  return httpService.get<TGetConversionMetadata>(urlConfig);
};

export const preparePaymentForCreditConversion = async (
  paymentSession?: PaymentSession,
  address?: Address
): Promise<AxiosResponse<PreparePaymentForCreditConversionResponse>> => {
  const urlConfig = preparePaymentForCreditConversionUrlConfig();
  const requestBody = {
    paymentFlowId: paymentFlowAnalyticsService.purchaseFlowUuid,
    paymentSessionId: paymentSession?.id,
    address
  };

  return httpService.post<PreparePaymentForCreditConversionResponse>(urlConfig, requestBody);
};

export const sendPreparePaymentStatusEvent = (
  success: boolean | true,
  isTaxFlowEnabled: boolean | undefined,
  isProductPurchase: boolean | undefined,
  taxRateAvailable?: boolean
): void => {
  let purchaseStatus = success
    ? paymentFlowAnalyticsService.ENUM_PURCHASE_STATUS.PASSED_PREPARE_PAYMENT_REQUEST
    : paymentFlowAnalyticsService.ENUM_PURCHASE_STATUS.FAILED_PREPARE_PAYMENT_REQUEST;
  if (taxRateAvailable) {
    purchaseStatus =
      paymentFlowAnalyticsService.ENUM_PURCHASE_STATUS.PASSED_PREPARE_PAYMENT_REQUEST_WITH_TAX;
  }

  const viewName = isProductPurchase
    ? isTaxFlowEnabled
      ? paymentFlowAnalyticsService.ENUM_VIEW_NAME.CREDIT_PACKAGE_PURCHASE_MODAL_WITH_TAX
      : paymentFlowAnalyticsService.ENUM_VIEW_NAME.CREDIT_PACKAGE_PURCHASE_MODAL_WITHOUT_TAX
    : isTaxFlowEnabled
    ? paymentFlowAnalyticsService.ENUM_VIEW_NAME.CREDIT_CONVERSION_MODAL_WITH_TAX
    : paymentFlowAnalyticsService.ENUM_VIEW_NAME.CREDIT_CONVERSION_MODAL_WITHOUT_TAX;
  paymentFlowAnalyticsService.sendUserPurchaseStatusEvent(
    paymentFlowAnalyticsService.ENUM_TRIGGERING_CONTEXT.WEB_REDEEM_PAGE,
    purchaseStatus,
    undefined,
    viewName
  );
};

export const sendGetNextPurchasableMetadataStatusEvent = (success: boolean | true): void => {
  paymentFlowAnalyticsService.sendUserPurchaseStatusEvent(
    paymentFlowAnalyticsService.ENUM_TRIGGERING_CONTEXT.WEB_REDEEM_PAGE,
    success
      ? paymentFlowAnalyticsService.ENUM_PURCHASE_STATUS.PASSED_GET_NEXT_PURCHASABLE_METADATA
      : paymentFlowAnalyticsService.ENUM_PURCHASE_STATUS.FAILED_GET_NEXT_PURCHASABLE_METADATA,
    undefined,
    undefined
  );
};

export const sendUpdateAddressForCheckoutSessionStatusEvent = (
  success: boolean | true,
  isTaxFlowEnabled: boolean | undefined,
  isProductPurchase: boolean | undefined
): void => {
  const viewName = isProductPurchase
    ? isTaxFlowEnabled
      ? paymentFlowAnalyticsService.ENUM_VIEW_NAME.CREDIT_PACKAGE_PURCHASE_MODAL_WITH_TAX
      : paymentFlowAnalyticsService.ENUM_VIEW_NAME.CREDIT_PACKAGE_PURCHASE_MODAL_WITHOUT_TAX
    : isTaxFlowEnabled
    ? paymentFlowAnalyticsService.ENUM_VIEW_NAME.CREDIT_CONVERSION_MODAL_WITH_TAX
    : paymentFlowAnalyticsService.ENUM_VIEW_NAME.CREDIT_CONVERSION_MODAL_WITHOUT_TAX;
  paymentFlowAnalyticsService.sendUserPurchaseStatusEvent(
    paymentFlowAnalyticsService.ENUM_TRIGGERING_CONTEXT.WEB_REDEEM_PAGE,
    success
      ? paymentFlowAnalyticsService.ENUM_PURCHASE_STATUS.PASSED_UPDATE_ADDRESS_FOR_CHECKOUT_SESSION
      : paymentFlowAnalyticsService.ENUM_PURCHASE_STATUS.FAILED_UPDATE_ADDRESS_FOR_CHECKOUT_SESSION,
    undefined,
    viewName
  );
};

export const sendProcessPaymentStatusEvent = (
  success: boolean | true,
  isTaxFlowEnabled: boolean | undefined,
  isProductPurchase: boolean | undefined
): void => {
  const viewName = isProductPurchase
    ? isTaxFlowEnabled
      ? paymentFlowAnalyticsService.ENUM_VIEW_NAME.CREDIT_PACKAGE_PURCHASE_MODAL_WITH_TAX
      : paymentFlowAnalyticsService.ENUM_VIEW_NAME.CREDIT_PACKAGE_PURCHASE_MODAL_WITHOUT_TAX
    : isTaxFlowEnabled
    ? paymentFlowAnalyticsService.ENUM_VIEW_NAME.CREDIT_CONVERSION_MODAL_WITH_TAX
    : paymentFlowAnalyticsService.ENUM_VIEW_NAME.CREDIT_CONVERSION_MODAL_WITHOUT_TAX;
  paymentFlowAnalyticsService.sendUserPurchaseStatusEvent(
    paymentFlowAnalyticsService.ENUM_TRIGGERING_CONTEXT.WEB_REDEEM_PAGE,
    success
      ? paymentFlowAnalyticsService.ENUM_PURCHASE_STATUS.PASSED_PROCESS_PAYMENT
      : paymentFlowAnalyticsService.ENUM_PURCHASE_STATUS.FAILED_PROCESS_PAYMENT,
    undefined,
    viewName
  );
};

export const getRedeemMetadata = () => {
  const urlConfig = getRedeemGiftCardMetadataUrlConfig();
  return httpService.get(urlConfig);
};

export const getTwentyPercentMoreRobuxStatus = async (): Promise<boolean> => {
  if (ExperimentationService?.getAllValuesForLayer) {
    const ixpUKResult = await ExperimentationService.getAllValuesForLayer(
      twentyPercentMoreRobuxUKLayerName
    );
    const ixpBrazilResult = await ExperimentationService.getAllValuesForLayer(
      twentyPercentMoreRobuxBrazilLayerName
    );
    return ixpUKResult?.packagesVariant === 1 || ixpBrazilResult?.packagesVariant === 1;
  }
  return false;
};

export const redeemPaymentsGateway = (
  pinValue: string,
  unifiedCaptchaId: string,
  token: string,
  captchaProvider: string,
  redeemConsentClicked: boolean,
  continueWithCreditConversion = false
) => {
  const urlConfig = redeemPaymentsGatewayConfig();
  const body = {
    pinCode: pinValue,
    captchaId: unifiedCaptchaId,
    captchaToken: token,
    captchaProvider,
    redeemConsentClicked,
    continueWithCreditConversion
  };
  return httpService.post(urlConfig, body);
};
