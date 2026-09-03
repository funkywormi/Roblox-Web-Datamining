import environmentUrls from "@rbx/environment-urls";
import baseApi from "./common/baseApi";

export type TGiftRobuxCurrency = {
  id: number;
  currencyType: number;
  currencyCode: string;
  currencyName: string;
  currencySymbol: string;
};

export type TGiftRobuxPrice = {
  amount: number;
  currency: TGiftRobuxCurrency;
  usdAmount: number;
};

export type TGiftRobuxProduct = {
  productId: number;
  premiumFeatureId: number;
  mobileProductId: string;
  robuxAmount: number;
  premiumFeatureTypeName: string;
  subscriptionTypeName?: string;
  isSubscriptionOnly: boolean;
  price: TGiftRobuxPrice;
  description: string;
  name: string;
  defaultDisplayName: string;
  isPopular: boolean;
};

export type TPrepareGiftRobuxCheckoutRequest = {
  preparePaymentRequest: {
    paymentMethod: "StripeCard";
    productId: number;
  };
  messageForRecipientTranslationKey: string;
  idempotencyKey: string;
  verifiedPhoneId: null;
  recipientUserId: number;
  isFromParentalControls: true;
};

export type TPrepareGiftRobuxCheckoutResponse = {
  isSuccess: boolean;
  failureReason?: string;
  paymentMethod?: string;
  providerPayload?: {
    checkoutUrl?: string;
  };
};

type TGetGiftRobuxProductsResponse = {
  products: TGiftRobuxProduct[];
};

const giftRobuxProductsApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
    getGiftRobuxProducts: builder.query<TGiftRobuxProduct[], void>({
      query: () => ({
        url: `${environmentUrls.premiumFeaturesApi}/v1/products?flowTypeName=GiftRobuxProduct`,
      }),
      transformResponse(response: TGetGiftRobuxProductsResponse): TGiftRobuxProduct[] {
        return (response.products ?? []).filter(
          product => !product.isSubscriptionOnly && product.premiumFeatureTypeName === "Robux",
        );
      },
    }),
    prepareGiftRobuxCheckout: builder.mutation<
      TPrepareGiftRobuxCheckoutResponse,
      TPrepareGiftRobuxCheckoutRequest
    >({
      query: requestBody => ({
        url: `${environmentUrls.apiGatewayUrl}/payments-gateway/v1/gifting/prepare-payment`,
        postBody: requestBody,
      }),
    }),
  }),
});

export const { useLazyGetGiftRobuxProductsQuery, usePrepareGiftRobuxCheckoutMutation } =
  giftRobuxProductsApi;
