import environmentUrls from "@rbx/environment-urls";
import {
  Configuration,
  ProductType,
  SubscriptionsV2Api,
  type SubscriptionProductInfo,
} from "@rbx/client-subscriptions-api/v1";
import baseApi from "./common/baseApi";

const configuration = new Configuration({
  robloxSiteDomain: environmentUrls.domain,
  basePath: `${environmentUrls.apiGatewayUrl}/subscriptions`,
  credentials: "include",
});

const subscriptionsV2Api = new SubscriptionsV2Api(configuration);

const subscriptionsApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    // Roblox Plus (Blackbird) product for the upsell sheet.
    getPlusSubscriptionProduct: builder.query<SubscriptionProductInfo | null, void>({
      queryFn: async () => {
        try {
          const { productKeys } =
            await subscriptionsV2Api.subscriptionsV2ListAvailableSubscriptionProducts({
              productType: ProductType.Blackbird,
            });

          const productKey = productKeys?.[0];
          if (!productKey) {
            // No purchasable Plus product (e.g. the user already has Plus) — nothing to upsell.
            return { data: null };
          }

          const { subscriptionProductInfo } =
            await subscriptionsV2Api.subscriptionsV2GetSubscriptionProductInfo({
              subscriptionProductType: productKey.type,
              subscriptionProductId: productKey.id,
            });

          return { data: subscriptionProductInfo };
        } catch {
          return {
            error: { status: "CUSTOM_ERROR", error: "Failed to load subscription product" },
          };
        }
      },
    }),
  }),
});

export const { useGetPlusSubscriptionProductQuery } = subscriptionsApi;

export default subscriptionsApi;
