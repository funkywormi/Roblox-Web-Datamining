import { useCallback } from "react";
import { useRestrictionScope } from "../contexts/RestrictionScopeContext";
import { useUniversalFeatureRestrictionsConfig } from "../contexts/UniversalFeatureRestrictionsConfigContext";
import { buildAnalyticsEvent, type AdditionalFields } from "./analyticsContracts";
import type { EventType } from "./eventConstants";

/**
 * Returns a sender that builds the typed analytics event and forwards it to the host's injected
 * sender.
 *
 * No-ops in read-only (informational/preview) mode — we never log analytics for informational
 * surfaces such as the Safety Dashboard since they would dilute real-violation metrics.
 */
export function useSendAnalyticsEvent(): (
  eventType: EventType,
  additionalFields?: AdditionalFields,
) => void {
  const { sendAnalyticsEvent, placement } = useUniversalFeatureRestrictionsConfig();
  const { abuseVector, readOnly } = useRestrictionScope();

  return useCallback(
    (eventType, additionalFields) => {
      if (readOnly) {
        return;
      }

      sendAnalyticsEvent(buildAnalyticsEvent(eventType, abuseVector, placement, additionalFields));
    },
    [abuseVector, placement, readOnly, sendAnalyticsEvent],
  );
}
