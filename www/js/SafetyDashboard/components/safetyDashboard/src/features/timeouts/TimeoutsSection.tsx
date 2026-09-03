import { useState } from "react";
import { useHistory } from "react-router-dom";
import { List } from "@rbx/foundation-ui";
import { useTranslation } from "@rbx/core-scripts/react";
import {
  isOverrideBackedAbuseVector,
  useUniversalFeatureRestrictions,
  type Overrides,
} from "@rbx/universal-feature-restrictions";
import useAccountStanding from "../../api/useAccountStanding";
import TimeoutRow from "./TimeoutRow";
import { InterventionType } from "../../types/api";
import { SafetyDashboardEventType } from "../../telemetry/eventTypes";
import { sendSafetyDashboardEvent } from "../../telemetry/sendSafetyDashboardEvent";
import {
  activeRestrictedFeatures,
  interventionDurationDays,
  interventionEndDate,
  isInterventionExpired,
} from "../../shared/utils/intervention";
import type { RestrictedFeature } from "../../shared/utils/intervention";
import { FALLBACK_ICON, featureIconClass } from "../../shared/utils/icons";
import { getDetailPath } from "../../shared/utils/navigation";

interface TimeoutsSectionProps {
  onAccountRestrictionOpen: () => void;
}

/**
 * Renders a list of all current timeouts for the user. This includes account restrictions and feature restrictions.
 * When a user has both account and feature restrictions, the feature restrictions are collapsed with an option to
 * expand them. If the user has no timeouts, we don't need to render anything.
 *
 */
const TimeoutsSection = ({ onAccountRestrictionOpen }: TimeoutsSectionProps) => {
  const history = useHistory();
  const { translate } = useTranslation();
  const { data } = useAccountStanding();
  const { showFeatureRestriction, closeFeatureRestriction } = useUniversalFeatureRestrictions();

  const [showAllTimeouts, setShowAllTimeouts] = useState(false);

  const status = data?.statusInfo.status;
  const worstIntervention = data?.worstPlatformIntervention?.type;

  const handleFeatureTimeoutPress = (feature: RestrictedFeature) => {
    sendSafetyDashboardEvent(
      SafetyDashboardEventType.FeatureTimeoutPress,
      { abuseVector: feature.abuseVector },
      status,
      worstIntervention,
    );

    const { abuseVector, labelName: label, intervention } = feature;
    const endDate = interventionEndDate(intervention);
    const overrides: Overrides = {
      label,
      readOnly: true,
      onAppealsRedirect: violationUid => {
        closeFeatureRestriction();
        history.push(violationUid ? getDetailPath(violationUid) : "/violations");
      },
      /**
       * Override-backed vectors (e.g. voice) skip the not-approved fetch and take their timing from
       * account-standing instead.
       */
      ...(isOverrideBackedAbuseVector(abuseVector) && endDate
        ? { restriction: { duration: intervention.duration ?? 0, endDate } }
        : {}),
    };

    showFeatureRestriction({
      abuseVector,
      overrides,
    });
  };

  /**
   * In the case of no data, we don't need to render anything so that we don't clutter the UI. For
   * an error case, the Status Hero component will handle the messaging and retry logic since they
   * rely on the same API call so we also don't need to render anything.
   */
  if (!data) {
    return null;
  }

  const accountLevelIntervention = data.worstPlatformIntervention;
  const accountInterventionRow =
    accountLevelIntervention &&
    accountLevelIntervention.type !== InterventionType.Delete &&
    !isInterventionExpired(accountLevelIntervention)
      ? {
          label:
            accountLevelIntervention.type === InterventionType.Warn
              ? translate("Heading.Warning")
              : translate("Heading.VariableDaySuspension", {
                  number: interventionDurationDays(accountLevelIntervention.duration),
                }),
          endDate: interventionEndDate(accountLevelIntervention),
        }
      : undefined;

  const featureRows = activeRestrictedFeatures(data.features);
  const hasFeatureRows = featureRows.length > 0;

  /**
   * If the user has no timeouts, we don't need to render anything. Again, we don't want
   * to clutter the UI with empty space the user doesn't need to see.
   */
  if (!accountInterventionRow && featureRows.length === 0) {
    return null;
  }

  return (
    <div data-testid="timeouts-section" className="flex flex-col items-start gap-medium">
      <h2 className="text-heading-small content-emphasis">
        {translate("Heading.CurrentTimeouts")}
      </h2>

      <List className="stroke-standard stroke-default radius-large width-full clip">
        {accountInterventionRow && (
          <TimeoutRow
            label={accountInterventionRow.label}
            iconClass={FALLBACK_ICON}
            endDate={accountInterventionRow.endDate}
            divider={hasFeatureRows && showAllTimeouts ? "Full" : "None"}
            onPress={() => {
              sendSafetyDashboardEvent(
                SafetyDashboardEventType.AccountTimeoutPress,
                { interventionType: accountLevelIntervention?.type },
                status,
                worstIntervention,
              );
              onAccountRestrictionOpen();
            }}
          />
        )}

        {/* Show feature timeouts: always if no account timeout, or when expanded */}
        {(!accountInterventionRow || showAllTimeouts) &&
          featureRows.map((feature, index) => (
            <TimeoutRow
              key={feature.abuseVector}
              label={feature.labelName}
              iconClass={featureIconClass(feature.iconName)}
              endDate={interventionEndDate(feature.intervention)}
              divider={index < featureRows.length - 1 ? "Full" : "None"}
              onPress={() => {
                handleFeatureTimeoutPress(feature);
              }}
            />
          ))}
      </List>

      {/* When both account and feature timeouts exist, feature timeouts are collapsed */}
      {accountInterventionRow && hasFeatureRows && !showAllTimeouts && (
        <button
          type="button"
          className="text-body-small content-default padding-none bg-none stroke-none cursor-pointer hover:underline"
          /**
           * The default styling makes the underline too close to the text itself compared to the design we use in Figma.
           * We need this custom styling since there's no existing Foundatation Tailwind tag for this.
           */
          style={{ textUnderlineOffset: "3px" }}
          onClick={() => {
            sendSafetyDashboardEvent(
              SafetyDashboardEventType.ShowAllTimeouts,
              { featureCount: featureRows.length },
              status,
              worstIntervention,
            );
            setShowAllTimeouts(true);
          }}
        >
          {translate("Action.ShowAllTimeouts")}
        </button>
      )}
    </div>
  );
};

export default TimeoutsSection;
