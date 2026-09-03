import { useCallback, useContext, useEffect, useMemo } from "react";
import pfas from "@rbx/core-scripts/payments-flow";
import { BuyRobuxPageContext } from "../contexts/BuyRobuxPageContext";
import { getTriggerContext } from "../utils/getTriggerContext";
import { useApplePayAvailabilityTracking } from "./useApplePayAvailabilityTracking";
import { useScrollTracking } from "./useScrollTracking";

export type Tracking = {
  trackFlow: (
    viewName: VIEW_NAME,
    eventType: PURCHASE_EVENT_TYPE,
    viewMessage?: VIEW_MESSAGE,
    eventMetadata?: object,
  ) => void;
  trackStatus: (viewName: VIEW_NAME, status: PURCHASE_EVENT_STATUS, viewMessage?: string) => void;
};

type VIEW_NAME = NonNullable<Parameters<typeof pfas.sendUserPurchaseFlowEvent>[2]>;
type PURCHASE_EVENT_TYPE = NonNullable<Parameters<typeof pfas.sendUserPurchaseFlowEvent>[3]>;
type VIEW_MESSAGE = NonNullable<Parameters<typeof pfas.sendUserPurchaseFlowEvent>[4]>;

type PURCHASE_EVENT_STATUS = NonNullable<Parameters<typeof pfas.sendUserPurchaseStatusEvent>[1]>;

export function useTracking(): Tracking {
  const {
    limitedTimeBonusItem,
    bonusItemId,
    paymentSession,
    productIds,
    robuxBalance,
    sectionNames,
    subscriptionProductIds,
    urlSearchParams,
  } = useContext(BuyRobuxPageContext);

  const applePayAvailability = useApplePayAvailabilityTracking();
  const { seenProducts, seenSections, seenSubscriptionProducts } = useScrollTracking();

  const {
    ENUM_VIEW_NAME: { PREMIUM_PURCHASE, PRODUCT_PURCHASE, PRODUCT_PURCHASE_IMPRESSION },
    ENUM_PURCHASE_EVENT_TYPE: { VIEW_SHOWN, USER_INPUT },
  } = pfas;

  const contextMetadata = useMemo(
    () => ({
      applePayAvailability: applePayAvailability?.toString() ?? "",
      // Entry-point context from the `ctx` URL param (e.g. "redirect");
      // empty when absent, matching the sibling fields.
      ctx: urlSearchParams.get("ctx") ?? "",
      limitedTimeBonusItemIds: limitedTimeBonusItem.ids.toString(),
      // Unauth: empty string so impression events still fire.
      paymentSessionId: paymentSession?.id ?? "",
      personalizedBonusItem: bonusItemId?.toString() ?? "",
      robuxBalance: robuxBalance?.toString() ?? "",
      robuxPackageIds: productIds.toString(),
      sectionNames: sectionNames.toString(),
      subscriptionProductIds: subscriptionProductIds.toString(),
    }),
    [
      applePayAvailability,
      urlSearchParams,
      limitedTimeBonusItem,
      paymentSession,
      bonusItemId,
      robuxBalance,
      productIds,
      sectionNames,
      subscriptionProductIds,
    ],
  );

  const trackFlow = useCallback(
    (
      viewName: VIEW_NAME,
      eventType: PURCHASE_EVENT_TYPE,
      viewMessage?: VIEW_MESSAGE,
      eventMetadata?: object,
    ) => {
      pfas.sendUserPurchaseFlowEvent(
        getTriggerContext(viewName === PREMIUM_PURCHASE),
        true,
        viewName,
        eventType,
        viewMessage,
        {
          ...contextMetadata,
          ...eventMetadata,
        },
      );
    },
    [contextMetadata, PREMIUM_PURCHASE],
  );

  const trackStatus = useCallback(
    (viewName: VIEW_NAME, status: PURCHASE_EVENT_STATUS, viewMessage?: string) => {
      pfas.sendUserPurchaseStatusEvent(
        getTriggerContext(viewName === PREMIUM_PURCHASE),
        status,
        viewMessage,
        viewName,
      );
    },
    [PREMIUM_PURCHASE],
  );

  useEffect(() => {
    if (robuxBalance !== undefined && applePayAvailability !== undefined) {
      trackFlow(PRODUCT_PURCHASE, VIEW_SHOWN);
    }
  }, [robuxBalance, applePayAvailability, trackFlow, PRODUCT_PURCHASE, VIEW_SHOWN]);

  useEffect(() => {
    if (seenProducts.length > 0 || seenSections.length > 0 || seenSubscriptionProducts.length > 0) {
      trackFlow(PRODUCT_PURCHASE_IMPRESSION, USER_INPUT, undefined, {
        seenProducts: seenProducts.toString(),
        seenSections: seenSections.toString(),
        // Subscription products carry both an id and a product type, so a
        // single JSON-stringified array preserves the pairing without forcing
        // downstream consumers to align two parallel CSV fields by index.
        seenSubscriptionProducts: JSON.stringify(seenSubscriptionProducts),
      });
    }
  }, [
    seenProducts,
    seenSections,
    seenSubscriptionProducts,
    trackFlow,
    PRODUCT_PURCHASE_IMPRESSION,
    USER_INPUT,
  ]);

  return {
    trackFlow,
    trackStatus,
  };
}
