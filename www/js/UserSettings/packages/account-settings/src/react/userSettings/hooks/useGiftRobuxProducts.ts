import * as React from "react";
import { useLazyGetGiftRobuxProductsQuery } from "../../apis/giftRobuxProductsApi";
import type { TGiftRobuxProduct } from "../../apis/giftRobuxProductsApi";
import { trackCounter } from "../giftRobux/observability";

type ProductsLoadFailureType = "empty" | "error";

export type GiftRobuxProductsLoadOutcome = "success" | ProductsLoadFailureType;

const trackProductsLoadFailed = (failureType: ProductsLoadFailureType): void => {
  trackCounter("ProductsLoadFailed", { failureType });
};

export type UseGiftRobuxProductsResult = {
  isError: boolean;
  isFetching: boolean;
  isUninitialized: boolean;
  loadProducts: () => Promise<GiftRobuxProductsLoadOutcome>;
  products: TGiftRobuxProduct[] | undefined;
};

const useGiftRobuxProducts = (): UseGiftRobuxProductsResult => {
  const [fetchGiftRobuxProducts, { data: products, isFetching, isError, isUninitialized }] =
    useLazyGetGiftRobuxProductsQuery();

  const loadProducts = React.useCallback(async (): Promise<GiftRobuxProductsLoadOutcome> => {
    trackCounter("ProductsLoadStarted");

    try {
      const loadedProducts = await fetchGiftRobuxProducts().unwrap();

      if (!loadedProducts.length) {
        trackProductsLoadFailed("empty");
        return "empty";
      }

      trackCounter("ProductsLoadSuccess");
      return "success";
    } catch {
      trackProductsLoadFailed("error");
      return "error";
    }
  }, [fetchGiftRobuxProducts]);

  return {
    isError,
    isFetching,
    isUninitialized,
    loadProducts,
    products,
  };
};

export default useGiftRobuxProducts;
