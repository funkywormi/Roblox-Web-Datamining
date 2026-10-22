import { useCallback } from "react";
import paymentFlowAnalyticsService from "@rbx/core-scripts/payments-flow";
import { Product } from "../types/buyRobuxPageData";
import { trackCounter } from "../observability";
import { Tracking } from "./useTracking";

export type RedirectTracking = {
  trackRedirectClick: ({
    product,
    isSubscriptionRedirect,
    loginRedirectVersion,
  }: {
    product?: Product;
    isSubscriptionRedirect: boolean;
    loginRedirectVersion: "v1" | "v2" | undefined;
  }) => void;
};

export function useRedirectTracking({ trackFlow }: Tracking): RedirectTracking {
  const trackRedirectClick = useCallback(
    ({
      product,
      isSubscriptionRedirect,
      loginRedirectVersion,
    }: {
      product?: Product;
      isSubscriptionRedirect: boolean;
      loginRedirectVersion: "v1" | "v2" | undefined;
    }) => {
      trackCounter("MobileToWebPurchaseRedirect", {
        version: loginRedirectVersion ?? "none",
      });

      let viewName;
      if (product) {
        viewName = isSubscriptionRedirect
          ? paymentFlowAnalyticsService.ENUM_VIEW_NAME.PREMIUM_PURCHASE
          : paymentFlowAnalyticsService.ENUM_VIEW_NAME.PRODUCT_PURCHASE;
      } else {
        viewName = paymentFlowAnalyticsService.ENUM_VIEW_NAME.ROBUX_REDIRECT_BANNER;
      }

      trackFlow(
        viewName,
        paymentFlowAnalyticsService.ENUM_PURCHASE_EVENT_TYPE.USER_INPUT,
        paymentFlowAnalyticsService.ENUM_VIEW_MESSAGE.BUY_REDIRECT,
        {
          productId: product?.productId.toString() ?? "",
        },
      );
    },
    [trackFlow],
  );

  return {
    trackRedirectClick,
  };
}
