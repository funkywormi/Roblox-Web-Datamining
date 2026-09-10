import { useQuery } from "@tanstack/react-query";
import playButtonService from "../services/playButtonService";
import { TGetProductDetails, TGetProductInfo } from "../types/playButtonTypes";

export const PURCHASE_PRODUCT_DATA_QUERY_KEY = "purchaseProductData";
const STALE_TIME_MS = 30000; // 30 seconds

// Discriminated on isLoading so consumers get productInfo/productDetails narrowed
// to defined once isLoading is false, without a separate undefined check.
type TPurchaseProductData =
  | { isLoading: true; productInfo: undefined; productDetails: undefined }
  | { isLoading: false; productInfo: TGetProductInfo; productDetails: TGetProductDetails };

/**
 * Fetches the product info + details the purchase button needs.
 *
 * Uses react-query so PurchaseButtonContainer and DefaultPlayButton share a
 * single request for the same universe/place instead of duplicating fetches.
 * This lets PlayButton know when the purchase button is ready and withhold the
 * Play Demo button until then (avoiding a spinner-with-demo intermediate state).
 */
const usePurchaseProductData = (
  universeId: string,
  placeId: string,
  enabled = true,
): TPurchaseProductData => {
  const { data } = useQuery({
    queryKey: [PURCHASE_PRODUCT_DATA_QUERY_KEY, universeId, placeId],
    queryFn: async () => {
      const [productInfo, productDetails] = await Promise.all([
        playButtonService.getProductInfo([universeId]),
        playButtonService.getProductDetails([placeId]),
      ]);
      return { productInfo, productDetails };
    },
    enabled,
    staleTime: STALE_TIME_MS,
  });

  const productInfo = data?.productInfo;
  const productDetails = data?.productDetails;

  // Loading until both product info and details have been fetched.
  if (productInfo === undefined || productDetails === undefined) {
    return { isLoading: true, productInfo: undefined, productDetails: undefined };
  }

  return { isLoading: false, productInfo, productDetails };
};

export default usePurchaseProductData;
