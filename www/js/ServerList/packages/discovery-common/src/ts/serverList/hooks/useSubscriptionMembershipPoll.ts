import { useCallback, useEffect, useState } from "react";
import { flushSync } from "react-dom";
import { ProductType } from "@rbx/client-subscriptions-api/v1";
import { useSubscriptionMembershipQuery } from "./useSubscriptionMembershipQuery";

const DEFAULT_PRODUCT_TYPE = ProductType.Blackbird;
const POLL_INTERVAL_MS = 1500;
const POLL_TIMEOUT_MS = 60000;

type UseSubscriptionMembershipPollOptions = {
  /** Product type to check membership for (defaults to Blackbird/Roblox Plus). */
  productType?: ProductType;
  /**
   * Fired exactly once when an active subscription is observed during polling.
   * Polling stops automatically before this fires.
   */
  onMembershipDetected: () => void;
};

/**
 * Polls the subscriptions list endpoint after a user initiates a native
 * in-app purchase, so the consumer can react (e.g., reload the page) once the
 * purchase completes. Stops automatically after a hard timeout to avoid
 * polling indefinitely if the user dismisses the native modal.
 *
 * Mirrors the /plus PurchaseView post-purchase polling pattern.
 */
const useSubscriptionMembershipPoll = ({
  productType = DEFAULT_PRODUCT_TYPE,
  onMembershipDetected,
}: UseSubscriptionMembershipPollOptions) => {
  const [isPolling, setIsPolling] = useState(false);

  const membershipQuery = useSubscriptionMembershipQuery(productType, {
    enabled: isPolling,
    refetchInterval: isPolling ? POLL_INTERVAL_MS : false,
    retry: 3,
  });

  useEffect(() => {
    if (!isPolling) {
      return;
    }
    const timeout = setTimeout(() => {
      setIsPolling(false);
    }, POLL_TIMEOUT_MS);
    return () => {
      clearTimeout(timeout);
    };
  }, [isPolling]);

  useEffect(() => {
    if (!isPolling || membershipQuery.data !== true) {
      return;
    }
    setIsPolling(false);
    onMembershipDetected();
  }, [isPolling, membershipQuery.data, onMembershipDetected]);

  // Fire-and-forget refetch on focus return (modal close) to detect the
  // entitlement faster than the next refetchInterval tick. Must not stop
  // polling on a no-membership result - that races receipt propagation.
  const { refetch } = membershipQuery;
  useEffect(() => {
    if (!isPolling || typeof document === "undefined") {
      return;
    }
    const onVisible = () => {
      if (document.visibilityState === "visible") {
        refetch().catch(() => {
          /* react-query surfaces errors via the query result; ignore here. */
        });
      }
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [isPolling, refetch]);

  // flushSync so the parent's isLoading prop reaches the subscribe button
  // before the browser processes the anchor's default-action navigation;
  // without it React 17 batches the update past the IAP overlay opening.
  const startPolling = useCallback(() => {
    flushSync(() => {
      setIsPolling(true);
    });
  }, []);

  const stopPolling = useCallback(() => {
    setIsPolling(false);
  }, []);

  return { startPolling, stopPolling, isPolling };
};

export default useSubscriptionMembershipPoll;
