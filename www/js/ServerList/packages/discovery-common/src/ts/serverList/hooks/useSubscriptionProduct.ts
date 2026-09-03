import { useQuery } from "@tanstack/react-query";
import * as http from "@rbx/core-scripts/http";
import environmentUrls from "@rbx/environment-urls";
import { ProductType } from "@rbx/client-subscriptions-api/v1";

export type SubscriptionProductMoney = {
  currencyCode: string;
  units: number;
  nanos: number;
};

export type SubscriptionProductOffer = {
  offerType?: string;
};

export type SubscriptionProductFeatureConfig = {
  virtualTransactionDiscounts: {
    tierId: string;
    periodIndex: number;
    discountPercent: number;
  }[];
  isRobuxTransferEnabled: boolean;
  isTradingEnabled: boolean;
  isUgcPublishingEnabled: boolean;
};

export type SubscriptionProductData = {
  productKey: { type: ProductType; id: string };
  periodType: string;
  localizedPrice: SubscriptionProductMoney;
  localizedPriceDisplayString: string;
  productTypeDetails: {
    robloxSubscriptionProductDetails?: {
      featureConfig: SubscriptionProductFeatureConfig;
    };
  };
  eligibleOffers: SubscriptionProductOffer[];
};

const SUBSCRIPTIONS_BASE_PATH = `${environmentUrls.apiGatewayUrl}/subscriptions`;

type ListProductsResponse = {
  productKeys: { type: string; id: string }[];
};

type GetProductInfoResponse = {
  subscriptionProductInfo: SubscriptionProductData;
};

export const subscriptionProductQueryKeys = {
  productId: () => ["subscription-product", "product-id"] as const,
  productInfo: (productId?: string) => ["subscription-product", "product-info", productId] as const,
};

const useSubscriptionProduct = () => {
  const productIdQuery = useQuery({
    queryKey: subscriptionProductQueryKeys.productId(),
    queryFn: async () => {
      const { data } = await http.get<ListProductsResponse>(
        { url: `${SUBSCRIPTIONS_BASE_PATH}/v2/products`, withCredentials: true },
        { ProductType: "Blackbird", IncludePurchased: true },
      );

      const product = data.productKeys[0];
      if (!product) throw new Error("No Plus subscription product found");
      return product;
    },
    retry: 3,
    retryDelay: 100,
  });

  const productInfoQuery = useQuery({
    queryKey: subscriptionProductQueryKeys.productInfo(productIdQuery.data?.id),
    queryFn: async () => {
      const key = productIdQuery.data;
      if (!key) throw new Error("Product key is required");

      const { data } = await http.get<GetProductInfoResponse>({
        url: `${SUBSCRIPTIONS_BASE_PATH}/v2/products/${encodeURIComponent(key.type)}/${encodeURIComponent(key.id)}`,
        withCredentials: true,
      });
      return data.subscriptionProductInfo;
    },
    enabled: Boolean(productIdQuery.data),
    retry: 3,
    retryDelay: 100,
  });

  return {
    subscriptionProduct: productInfoQuery.data,
    isLoading:
      productIdQuery.isLoading ||
      (productInfoQuery.isLoading && productInfoQuery.fetchStatus !== "idle"),
    hasError: productIdQuery.isError || productInfoQuery.isError,
  };
};

export default useSubscriptionProduct;
