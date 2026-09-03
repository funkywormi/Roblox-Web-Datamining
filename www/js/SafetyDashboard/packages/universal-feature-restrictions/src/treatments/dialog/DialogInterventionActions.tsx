import { Button } from "@rbx/foundation-ui";
import { useUniversalFeatureRestrictionsConfig } from "../../contexts/UniversalFeatureRestrictionsConfigContext";
import { type AdditionalFields } from "../../telemetry/analyticsContracts";
import { useSendAnalyticsEvent } from "../../telemetry/useSendAnalyticsEvent";
import { EventType } from "../../telemetry/eventConstants";
import { getTimeToInteract } from "../../shared/utils/getTimeToInteract";
import { useAcknowledgeIntervention } from "./useAcknowledgeIntervention";
import type { DialogInterventionAnalytics } from "./useDialogRestrictionModel";

interface Props {
  onDismiss: () => void;
  analytics: DialogInterventionAnalytics;
  dsaMessage?: string;
  mountTimeMs: number;
}

/**
 * Displays the CTAs and label for the intervention dialog.
 * The dialog will always display the OK button.
 * If a DSA message is provided, it will be displayed below the buttons.
 */
const DialogInterventionActions = ({ onDismiss, analytics, dsaMessage, mountTimeMs }: Props) => {
  const { translate } = useUniversalFeatureRestrictionsConfig();
  const sendAnalyticsEvent = useSendAnalyticsEvent();

  const { interventionId, interventionType, acknowledgeable } = analytics;
  const additionalAnalyticsFields: AdditionalFields = {
    interventionType,
    eventId: interventionId,
    acknowledgeable,
  };

  const { acknowledgeIntervention, isPending } = useAcknowledgeIntervention(analytics);

  const handleCtaClick = () => {
    sendAnalyticsEvent(EventType.CtaClicked, {
      timeToInteractSeconds: getTimeToInteract(mountTimeMs),
      ...additionalAnalyticsFields,
    });

    acknowledgeIntervention();
    onDismiss();
  };

  return (
    <div className="flex flex-col gap-small">
      <Button
        variant="Emphasis"
        size="Medium"
        className="width-full"
        onClick={handleCtaClick}
        isDisabled={isPending}
        isLoading={isPending}
      >
        {translate("Action.OK")}
      </Button>

      {dsaMessage && <p className="text-caption-small content-default margin-none">{dsaMessage}</p>}
    </div>
  );
};

export default DialogInterventionActions;
