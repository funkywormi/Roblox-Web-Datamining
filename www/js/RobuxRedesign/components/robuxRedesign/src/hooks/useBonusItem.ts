import { useContext, useEffect, useMemo } from "react";
import { removeItem, setItem } from "@rbx/core-lib/local-storage";
import "@rbx/payments/types";
import { BuyRobuxPageContext } from "../contexts/BuyRobuxPageContext";

export const BUY_ROBUX_CTX_LOCAL_STORAGE_KEY = "buyRobuxCtx" as const;
export const BUY_ROBUX_PRODUCT_ID_LOCAL_STORAGE_KEY = "buyRobuxProductId" as const;

export function useBonusItem(): void {
  const { urlParams } = useContext(BuyRobuxPageContext);
  const [ctxUrlParam, productIdUrlParam] = useMemo(
    () => [urlParams.ctx, urlParams.product_id],
    [urlParams],
  );

  useEffect(() => {
    if (ctxUrlParam) {
      setItem(BUY_ROBUX_CTX_LOCAL_STORAGE_KEY, ctxUrlParam);
    } else {
      removeItem(BUY_ROBUX_CTX_LOCAL_STORAGE_KEY);
    }
  }, [ctxUrlParam]);

  useEffect(() => {
    if (productIdUrlParam) {
      setItem(BUY_ROBUX_PRODUCT_ID_LOCAL_STORAGE_KEY, productIdUrlParam);
    } else {
      removeItem(BUY_ROBUX_PRODUCT_ID_LOCAL_STORAGE_KEY);
    }
  }, [productIdUrlParam]);
}
