import { useMutation, useQueryClient } from "@tanstack/react-query";
import { moderationDetailQueryKey } from "../../api/useModerationDetail";
import { useRestrictionScope } from "../../contexts/RestrictionScopeContext";
import { useUniversalFeatureRestrictionsConfig } from "../../contexts/UniversalFeatureRestrictionsConfigContext";
import type { AdditionalFields } from "../../telemetry/analyticsContracts";
import { EventType } from "../../telemetry/eventConstants";
import { useSendAnalyticsEvent } from "../../telemetry/useSendAnalyticsEvent";
import type { DialogInterventionAnalytics } from "./useDialogRestrictionModel";

/**
 * Acknowledges the current intervention when eligible, reports the outcome, and clears its cache.
 */
export const useAcknowledgeIntervention = (analytics: DialogInterventionAnalytics) => {
  const { api } = useUniversalFeatureRestrictionsConfig();
  const { readOnly, abuseVector } = useRestrictionScope();
  const sendAnalyticsEvent = useSendAnalyticsEvent();
  const queryClient = useQueryClient();

  const { interventionId, interventionType, acknowledgeable } = analytics;
  const additionalAnalyticsFields: AdditionalFields = {
    interventionType,
    eventId: interventionId,
    acknowledgeable,
  };

  const { mutate: dismissIntervention, isPending } = useMutation({
    mutationFn: (id: string) => api.dismissIntervention(id),
    onSuccess: () => {
      sendAnalyticsEvent(EventType.DialogInterventionDismissSuccess, additionalAnalyticsFields);
      queryClient.removeQueries({ queryKey: moderationDetailQueryKey(abuseVector) });
    },
    onError: (error: Error) => {
      sendAnalyticsEvent(EventType.DialogInterventionDismissFailed, {
        error: error.message,
        ...additionalAnalyticsFields,
      });
    },
  });

  const acknowledgeIntervention = () => {
    if (!readOnly && acknowledgeable && interventionId) {
      dismissIntervention(interventionId);
    }
  };

  return { acknowledgeIntervention, isPending };
};
