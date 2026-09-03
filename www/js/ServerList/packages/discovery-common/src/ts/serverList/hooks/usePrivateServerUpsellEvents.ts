import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef } from "react";
import { sendEventWithTarget, targetTypes } from "@rbx/core-scripts/event-stream";
import { getDeviceMeta } from "@rbx/core-scripts/meta/device";
import {
  PrivateServerEventType,
  PrivateServerEventContext,
} from "../../../js/serverList/analytics/privateServerLogging";
import {
  consumePsUpsellCheckoutPending,
  getPsUpsellPlatform,
  savePsUpsellCheckoutPending,
} from "../utils/psUpsellCheckout";
import { trackCounter } from "./trackCounter";
import { useSubscriptionMembershipQuery } from "./useSubscriptionMembershipQuery";

type PrivateServerUpsellEvents = {
  trackFreeWithPlusClick: () => void;
  trackSubscribeBannerClick: () => void;
  trackSubscribeSheetClick: () => void;
  trackSheetDismiss: () => void;
  trackUpsellBannerShown: () => void;
  trackUpsellShown: () => void;
  trackSubscribePurchaseSucceeded: () => void;
  trackSubscribePurchaseFailed: () => void;
};

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = (): void => {};

const PrivateServerUpsellEventsContext = createContext<PrivateServerUpsellEvents>({
  trackFreeWithPlusClick: noop,
  trackSubscribeBannerClick: noop,
  trackSubscribeSheetClick: noop,
  trackSheetDismiss: noop,
  trackUpsellBannerShown: noop,
  trackUpsellShown: noop,
  trackSubscribePurchaseSucceeded: noop,
  trackSubscribePurchaseFailed: noop,
});

function getDeviceProperties(): { deviceType: string; appType: string } {
  const meta = getDeviceMeta();
  return {
    deviceType: meta?.deviceType ?? "",
    appType: meta?.appType ?? "",
  };
}

function sendUpsellEvent(context: PrivateServerEventContext, universeId: number): void {
  sendEventWithTarget(
    PrivateServerEventType.PRIVATE_SERVER_PLUS_UPSELL,
    context,
    { universeId, ...getDeviceProperties() },
    targetTypes.WWW,
  );
}

export function PrivateServerUpsellEventsProvider({
  universeId,
  children,
}: {
  universeId: number;
  children: React.ReactNode;
}): React.ReactElement {
  // Device class doesn't change at runtime — compute once per provider mount.
  const platform = useMemo(() => getPsUpsellPlatform(), []);
  const dimensions = useMemo(() => ({ platform }), [platform]);

  // Detect return from desktop/mobileWeb redirect-away checkout. Mobile-in-app
  // is covered by SubscriptionSheet's polling instead. consume() removes the
  // flag on read, so capture once via ref.
  const hadPendingCheckoutRef = useRef<boolean>();
  if (hadPendingCheckoutRef.current === undefined) {
    hadPendingCheckoutRef.current = consumePsUpsellCheckoutPending();
  }
  const hadPendingCheckout = hadPendingCheckoutRef.current;
  const hasFiredCheckoutReturn = useRef(false);
  const checkoutReturnQuery = useSubscriptionMembershipQuery(undefined, {
    enabled: hadPendingCheckout,
  });

  useEffect(() => {
    if (!hadPendingCheckout || hasFiredCheckoutReturn.current) return;
    if (checkoutReturnQuery.isLoading || checkoutReturnQuery.data === undefined) return;
    hasFiredCheckoutReturn.current = true;
    const counter = checkoutReturnQuery.data
      ? "PrivateServerUpsellSubscribeSucceeded"
      : "PrivateServerUpsellCheckoutAbandoned";
    trackCounter(counter, dimensions);
  }, [hadPendingCheckout, checkoutReturnQuery.isLoading, checkoutReturnQuery.data, dimensions]);

  const trackFreeWithPlusClick = useCallback(() => {
    sendUpsellEvent(PrivateServerEventContext.PLUS_UPSELL_FREE_WITH_PLUS_CLICK, universeId);
  }, [universeId]);

  const trackSubscribeBannerClick = useCallback(() => {
    sendUpsellEvent(PrivateServerEventContext.PLUS_UPSELL_SUBSCRIBE_BANNER_CLICK, universeId);
  }, [universeId]);

  const trackSubscribeSheetClick = useCallback(() => {
    sendUpsellEvent(PrivateServerEventContext.PLUS_UPSELL_SUBSCRIBE_SHEET_CLICK, universeId);
    trackCounter("PrivateServerUpsellSubscribeAttempted", dimensions);
    if (platform !== "mobileInApp") {
      savePsUpsellCheckoutPending();
    }
  }, [universeId, dimensions, platform]);

  const trackSheetDismiss = useCallback(() => {
    sendUpsellEvent(PrivateServerEventContext.PLUS_UPSELL_SHEET_DISMISS, universeId);
    trackCounter("PrivateServerUpsellDismissed", dimensions);
  }, [universeId, dimensions]);

  const trackUpsellBannerShown = useCallback(() => {
    trackCounter("PrivateServerUpsellBannerShown", dimensions);
  }, [dimensions]);

  const trackUpsellShown = useCallback(() => {
    trackCounter("PrivateServerUpsellShown", dimensions);
  }, [dimensions]);

  const trackSubscribePurchaseSucceeded = useCallback(() => {
    trackCounter("PrivateServerUpsellSubscribeSucceeded", dimensions);
  }, [dimensions]);

  // Proxy for Subscribe-click-without-Succeeded: fired from the consumer when the
  // sheet is dismissed while membership polling is still in-flight.
  const trackSubscribePurchaseFailed = useCallback(() => {
    trackCounter("PrivateServerUpsellSubscribeFailed", dimensions);
  }, [dimensions]);

  const value = useMemo(
    () => ({
      trackFreeWithPlusClick,
      trackSubscribeBannerClick,
      trackSubscribeSheetClick,
      trackSheetDismiss,
      trackUpsellBannerShown,
      trackUpsellShown,
      trackSubscribePurchaseSucceeded,
      trackSubscribePurchaseFailed,
    }),
    [
      trackFreeWithPlusClick,
      trackSubscribeBannerClick,
      trackSubscribeSheetClick,
      trackSheetDismiss,
      trackUpsellBannerShown,
      trackUpsellShown,
      trackSubscribePurchaseSucceeded,
      trackSubscribePurchaseFailed,
    ],
  );

  return React.createElement(PrivateServerUpsellEventsContext.Provider, { value }, children);
}

export default function usePrivateServerUpsellEvents(): PrivateServerUpsellEvents {
  return useContext(PrivateServerUpsellEventsContext);
}
