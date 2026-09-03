import { useContext, useEffect, useMemo } from "react";
import localStorageService from "@rbx/core-scripts/local-storage";
import { BuyRobuxPageContext } from "../contexts/BuyRobuxPageContext";

export const BUY_ROBUX_CTX_LOCAL_STORAGE_KEY = "buyRobuxCtx";
export const BUY_ROBUX_PRODUCT_ID_LOCAL_STORAGE_KEY = "buyRobuxProductId";

export function useBonusItem(): void {
  const { urlSearchParams } = useContext(BuyRobuxPageContext);
  const [ctxUrlParam, productIdUrlParam] = useMemo(
    () => [urlSearchParams.get("ctx"), urlSearchParams.get("product_id")],
    [urlSearchParams],
  );

  useEffect(() => {
    if (ctxUrlParam) {
      localStorageService.setLocalStorage(BUY_ROBUX_CTX_LOCAL_STORAGE_KEY, ctxUrlParam);
    } else {
      localStorageService.removeLocalStorage(BUY_ROBUX_CTX_LOCAL_STORAGE_KEY);
    }
  }, [ctxUrlParam]);

  useEffect(() => {
    if (productIdUrlParam) {
      localStorageService.setLocalStorage(
        BUY_ROBUX_PRODUCT_ID_LOCAL_STORAGE_KEY,
        productIdUrlParam,
      );
    } else {
      localStorageService.removeLocalStorage(BUY_ROBUX_PRODUCT_ID_LOCAL_STORAGE_KEY);
    }
  }, [productIdUrlParam]);
}
