import { fetchPlusUpsellProduct } from "@rbx/subscriptions-common/plusUpsell";
import type { SubscriptionProductInfo } from "@rbx/client-subscriptions-api/v2";
import baseApi from "./common/baseApi";

const subscriptionsApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    // Roblox Plus (Blackbird) product for the upsell banner and sheet.
    getPlusSubscriptionProduct: builder.query<SubscriptionProductInfo | null, void>({
      queryFn: async () => {
        try {
          return { data: await fetchPlusUpsellProduct() };
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
