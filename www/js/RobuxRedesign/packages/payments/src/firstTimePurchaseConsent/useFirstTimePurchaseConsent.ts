import { useCallback, useEffect, useState } from "react";
import { getItem, setItem } from "@rbx/core-lib/local-storage";
import type { WithApiMetricsFn } from "../withApiMetrics/withApiMetrics";
import { getFeatureMetadata } from "./getFeatureMetadata";

function getConsentStorageKey(userId: string): string {
  return `firstTimePurchaseConsentAcknowledged_${userId}`;
}

export function useFirstTimePurchaseConsent(
  userId: string | undefined,
  withApiMetrics: WithApiMetricsFn<"GetFeatureMetadata">,
): {
  shouldShowFirstTimePurchaseConsent: boolean | undefined;
  markConsentAcknowledged: () => void;
} {
  const [shouldShowFirstTimePurchaseConsent, setShouldShowFirstTimePurchaseConsent] = useState<
    boolean | undefined
  >();

  useEffect(() => {
    let cancelled = false;

    if (!userId) {
      setShouldShowFirstTimePurchaseConsent(false);
      return undefined;
    }

    // @ts-expect-error -- This per-user key is generated dynamically and is not declared in LocalStorageRegistry.
    const alreadyConsented = getItem(getConsentStorageKey(userId)) === "true";
    if (alreadyConsented) {
      setShouldShowFirstTimePurchaseConsent(false);
      return undefined;
    }

    const fetchMetadata = async () => {
      const data = await getFeatureMetadata(userId, withApiMetrics);
      if (!cancelled) {
        setShouldShowFirstTimePurchaseConsent(Boolean(data?.shouldShowFirstTimePurchaseConsent));
      }
    };

    // eslint-disable-next-line no-void
    void fetchMetadata();

    return () => {
      cancelled = true;
    };
  }, [userId, withApiMetrics]);

  const markConsentAcknowledged = useCallback(() => {
    if (userId) {
      // @ts-expect-error -- This per-user key is generated dynamically and is not declared in LocalStorageRegistry.
      setItem(getConsentStorageKey(userId), "true");
    }
  }, [userId]);

  return { shouldShowFirstTimePurchaseConsent, markConsentAcknowledged };
}
