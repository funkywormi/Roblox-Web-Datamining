import { Badge, Divider } from "@rbx/foundation-ui";
import { useUniversalFeatureRestrictionsConfig } from "../../contexts/UniversalFeatureRestrictionsConfigContext";
import EvidenceField from "../../shared/components/EvidenceField";

interface Props {
  evidence?: string;
  violationReason?: string;
  formattedEndDate?: string;
  countdownText?: string;
  messageToUser?: string;
}

/**
 * Displays card with evidence, violation reason, and ending on date.
 * The component automatically renders/hides the appropriate sections based on the provided props.
 * If no valid data is provided, the component returns null.
 */
const DialogEvidenceCard = ({
  evidence,
  violationReason,
  formattedEndDate,
  countdownText,
  messageToUser,
}: Props) => {
  const { translate } = useUniversalFeatureRestrictionsConfig();

  const hasInfoBelowEvidence = [violationReason, formattedEndDate, messageToUser].some(Boolean);

  if (!evidence && !hasInfoBelowEvidence) {
    return null;
  }

  const isExpired = !countdownText;
  const badgeText = countdownText ?? translate("Label.Complete");

  return (
    <div className="flex flex-col gap-large padding-y-large radius-large stroke-default stroke-standard bg-shift-100">
      {evidence && (
        <p
          className="text-body-medium content-default padding-x-medium margin-none"
          style={{ whiteSpace: "pre-wrap" }}
        >
          {evidence}
        </p>
      )}

      {evidence && hasInfoBelowEvidence && <Divider />}

      {violationReason && (
        <div className="padding-x-medium">
          <EvidenceField fieldLabel={translate("Label.Reason")} fieldValue={violationReason} />
        </div>
      )}

      {messageToUser && (
        <div className="padding-x-medium">
          <EvidenceField
            fieldLabel={translate("Label.ModeratorNote")}
            fieldValue={messageToUser}
            preline
          />
        </div>
      )}

      {formattedEndDate && (
        <div className="padding-x-medium flex flex-row justify-between items-center">
          <EvidenceField
            fieldLabel={translate("Label.EndsOn")}
            fieldValue={formattedEndDate}
            hasColon={false}
          />
          <Badge
            variant="Neutral"
            label={badgeText}
            icon={isExpired ? undefined : "icon-filled-clock"}
          />
        </div>
      )}
    </div>
  );
};

export default DialogEvidenceCard;
