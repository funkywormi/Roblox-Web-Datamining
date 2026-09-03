import { Button } from "@rbx/foundation-ui";
import { useTranslation } from "@rbx/core-scripts/react";
import { translateHtml } from "@rbx/translation-utils";
import { formatter } from "../util/dateTime";
import { EnrichedViolation } from "../util/violations";
import { AppealEligibilityResponse } from "../../../api/useAppealEligibility";
import { SUPPORT_FORM_URL } from "../../../shared/url";
import AppealDisclosures from "./AppealDisclosures";
import { onSupportClick } from "../SupportItem";

interface Props {
  violation: EnrichedViolation;
  /** Opens the appeal text modal directly (used when no pre-condition is required). */
  onShowAppealModal: () => void;
  /**
   * Starts the IDV pre-condition flow before the appeal can be submitted. Called
   * instead of `onShowAppealModal` when eligibility is `false`.
   */
  onStartIdvFlow?: () => void;
  /** Appeal-creation eligibility for this violation, if it has been fetched. */
  eligibility?: AppealEligibilityResponse;
}

/**
 * Shown at the bottom of the Violation Details page to allow users to submit an appeal.
 * The component also always contains more information about the appeal (e.g. the time they have to appeal
 * their violation and a link to the Appeals Help Article (required by UK OSA).
 */
const SendAppealSection = ({
  violation,
  onShowAppealModal,
  onStartIdvFlow,
  eligibility,
}: Props) => {
  const { translate } = useTranslation();
  const expirationDate = formatter.getFullDate(violation.appeal_by_time);

  const showStandardAppeal = violation.appealMethod === "inline";
  const showSupportAppeal = violation.appealMethod === "support";

  /**
   * Eligibility refines the inline appeal entry:
   * - `isEligible === true`: the regular appeal modal opens directly.
   * - `isEligible === false`: the user must complete an IDV pre-condition first,
   *   so the button starts the IDV flow instead.
   * When eligibility hasn't been fetched (undefined, e.g. not yet loaded or the
   * request errored), we preserve the legacy behavior of the direct appeal button.
   */
  const requiresIdv = eligibility !== undefined && !eligibility.isEligible;

  return (
    <div className="flex flex-col gap-medium medium:items-start padding-top-small margin-bottom-medium">
      {showStandardAppeal && (
        <div className="flex flex-col gap-xsmall medium:items-start">
          <Button
            variant="Standard"
            size="Medium"
            onClick={requiresIdv ? onStartIdvFlow : onShowAppealModal}
            aria-label={translate("Action.SendAppeal")}
          >
            {translate("Action.SendAppeal")}
          </Button>
          {requiresIdv && (
            <p className="text-caption-small content-default">
              {translate("Description.AppealRequiresIdv")}
            </p>
          )}
        </div>
      )}

      {showSupportAppeal && (
        <p className="text-body-medium">
          {translateHtml(translate, "Description.AppealViaSupport", [
            {
              opening: "link",
              closing: "linkEnd",
              render: text => (
                <a
                  href={SUPPORT_FORM_URL}
                  onClick={onSupportClick}
                  className="underline"
                  style={{ textUnderlineOffset: "3px" }}
                >
                  {text}
                </a>
              ),
            },
          ])}
        </p>
      )}

      <div className="flex flex-col">
        {(showStandardAppeal || showSupportAppeal) && (
          <p className="text-body-small">
            {translate("Label.AppealByDate", { date: expirationDate })}
          </p>
        )}
        <AppealDisclosures />
      </div>
    </div>
  );
};

export default SendAppealSection;
