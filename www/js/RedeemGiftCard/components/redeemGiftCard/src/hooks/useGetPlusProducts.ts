import { useQuery } from "@tanstack/react-query";
import { CurrentUser } from "Roblox";
import {
  PaymentProvider,
  ProductType,
  SubscriptionProductInfo,
} from "@rbx/client-subscriptions-api/v1";
import { listAvailableSubscriptionProductsV2 } from "@rbx/payments/services/subscriptions";
import { trackCounter, trackError } from "@rbx/payments/creditCheckout";

export type TUseGetPlusProducts = {
  products: SubscriptionProductInfo[];
  isLoading: boolean;
};

/** Credit-purchasable Roblox Plus SKUs, fetched on mount. Empty for already-subscribed users. */
export default function useGetPlusProducts(): TUseGetPlusProducts {
  const { isAuthenticated } = CurrentUser;
  const { data: products = [], isLoading } = useQuery({
    queryKey: ["redeemGiftCard", "getPlusProducts"],
    enabled: isAuthenticated,
    queryFn: async () => {
      const response = await listAvailableSubscriptionProductsV2(
        ProductType.Blackbird,
        PaymentProvider.CreditBalance,
      );

      trackCounter("GetPlus_ListProducts_Success", {
        hasProducts: response.products.length > 0 ? "true" : "false",
      });

      return response.products;
    },
    onError: (error: unknown) => {
      trackError("Error_GetPlus_ListProducts_Failed", null, error);
    },
  });

  return { products, isLoading: isAuthenticated ? isLoading : false };
}
