import { EnvironmentUrls } from "@rbx/environment-urls";
import { httpService, uuidService } from "@rbx/core-scripts/legacy/core-utilities";
import type { AxiosResponse } from "@rbx/core-scripts/http";
import { Product } from "../constants/TypeDefinitions";

const getPreparePaymentConfig = () => ({
  withCredentials: true,
  url: `${EnvironmentUrls.apiGatewayUrl}/payments-gateway/v1/gifting/prepare-payment`,
});

export type PreparePaymentResponse = {
  isSuccess: boolean;
  failureReason: string;
  paymentMethod: string;
  selectedProduct: Product;
  providerPayload: Record<string, unknown>;
};

export const preparePayment = async (
  productId: number,
  messageForRecipientTranslationKey: string,
  verifiedPhoneId: string | null,
  recipientUserId: number,
): Promise<AxiosResponse<PreparePaymentResponse>> => {
  const urlConfig = getPreparePaymentConfig();

  const requestBody = {
    preparePaymentRequest: {
      paymentMethod: "StripeCard",
      productId,
    },
    messageForRecipientTranslationKey,
    idempotencyKey: verifiedPhoneId ?? uuidService.generateRandomUuid(),
    verifiedPhoneId,
    recipientUserId,
  };

  return httpService.post(urlConfig, requestBody);
};

const getProductsConfig = () => ({
  withCredentials: true,
  url: `${EnvironmentUrls.premiumFeaturesApi}/v1/products?flowTypeName=GiftRobuxProduct`,
});

export type GetProductsResponse = {
  products: Product[];
  twentyPercentMoreRobuxCanadaExpVariant: number;
  underHighCogsPricingTest: boolean;
};

export const getProducts = async (): Promise<AxiosResponse<GetProductsResponse>> => {
  const urlConfig = getProductsConfig();
  return httpService.get(urlConfig);
};

const getGiftingMetadataConfig = () => ({
  withCredentials: true,
  url: `${EnvironmentUrls.apiGatewayUrl}/payments-gateway/v1/gifting/metadata`,
});

export enum RecipientEligibilityType {
  Unspecified = 0,
  Eligible = 1,
  Ineligible = 2,
}

export enum PurchaserEligibilityType {
  Unspecified = 0,
  Eligible = 1,
  Ineligible = 2,
  EligibleAndDoesNotRequiresPhoneVerificationSession = 3,
}

export type GetGiftingMetadataResponse = {
  recipientEligibilityType: RecipientEligibilityType;
  purchaserEligibilityType: PurchaserEligibilityType;
  messageForRecipientTranslationKeys?: string[];
  giftingUrlWithPreselectedRecipientUserId?: string;
  legalDisclosureTranslationKey?: string;
};

export const getGiftingMetadata = async (
  recipientUserId: string | number,
): Promise<AxiosResponse<GetGiftingMetadataResponse>> => {
  const urlConfig = getGiftingMetadataConfig();
  const requestBody = {
    recipientUserId,
  };
  return httpService.get(urlConfig, requestBody);
};

const getUsernameConfig = () => ({
  withCredentials: true,
  url: `${EnvironmentUrls.usersApi}/v1/users`,
});

export type GetUserNameResponse = {
  data: {
    displayName: string | null;
    name: string | null;
  }[];
};

export const getUserName = async (userId: number): Promise<AxiosResponse<GetUserNameResponse>> => {
  const urlConfig = getUsernameConfig();
  const params = {
    userIds: [userId],
  };

  return httpService.post(urlConfig, params);
};
