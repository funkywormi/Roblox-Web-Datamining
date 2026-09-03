import { useTranslation } from "@rbx/core-scripts/react";
import Timestamp from "../Timestamp";
import { Appeal, EnrichedViolation } from "../../util/violations";
import getFilteredAbuseTypes from "../../util/getFilteredAbuseTypes";
import EvidenceField from "../EvidenceField";

interface Props {
  appeal: Appeal;
  isFinal: boolean;
  violation: EnrichedViolation;
}

/**
 * Determine if the appeal abuse type has changed from last appeal (if any) or from the initial
 * rejection.
 */
const hasAbuseTypeChanged = (appeal: Appeal, violation: EnrichedViolation) => {
  const currentKeys = Object.keys(appeal.abuse_type_keys);

  /*
   * I don't think we'll see this case going forward, but there has been
   * some in the past. We'll assume no change if missing abuse types on
   * the appeal.
   */
  if (currentKeys.length === 0) {
    return false;
  }

  /*
   * appeals [0] most recent
   * appeals [1] older (if any)
   * appeals [2] oldest (if any)
   */
  const { appeals } = violation;
  const appealIndex = appeals.findIndex(someAppeal => someAppeal === appeal);
  const prevAppeal: Appeal | undefined = appeals[appealIndex + 1];
  const prevAbuseTypeKeys = prevAppeal ? prevAppeal.abuse_type_keys : violation.abuse_type_keys;
  const prevKeys = Object.keys(prevAbuseTypeKeys);

  if (currentKeys.length !== prevKeys.length) {
    return true;
  }

  if (currentKeys.some(key => !prevKeys.includes(key))) {
    return true;
  }

  if (prevKeys.some(key => !currentKeys.includes(key))) {
    return true;
  }

  return false;
};

/**
 * We need to use different translations depending on the number of abuse types for the
 * violation. We only show up to 3 abuse types (i.e. if there are more than 3, we only show
 * the first three and the rest can only be seen in the "What happened" section).
 */
const getDenialDescription = (
  abuseTypes: string[],
  abuseTypeChanged: boolean,
  translate: (key: string, params?: Record<string, string>) => string,
): string => {
  if (abuseTypeChanged) {
    return translate("Description.AppealDeniedWithAdjustment");
  }

  const [first, second, third] = abuseTypes;

  if (abuseTypes.length === 0 || !first) {
    return translate("Description.AppealDenied.None");
  }

  if (abuseTypes.length === 1 || !second) {
    return translate("Description.AppealDenied.Singular", { singleViolation: first });
  }

  return translate("Description.AppealDenied.Multiple", {
    violationsList: third ? `${first}, ${second}` : first,
    singleViolation: third ?? second,
  });
};

/**
 * Shown on the appeal timeline when an appeal is denied (i.e. the user submitted an appeal
 * and we rejected it).
 *
 * In some cases, the violation abuse types may have changed after we take a look
 * at the evidence again so we need to show the user the new abuse types.
 */
const AppealRejectedItem = ({ appeal, isFinal, violation }: Props) => {
  const { translate } = useTranslation();

  const abuseTypeChanged = hasAbuseTypeChanged(appeal, violation);
  const abuseTypes = getFilteredAbuseTypes(appeal.abuse_type_keys, translate);
  const description = getDenialDescription(abuseTypes, abuseTypeChanged, translate);

  return (
    <div className="flex flex-col gap-xxsmall">
      <span className="text-title-medium">{translate("Header.AppealDenied")}</span>
      <Timestamp timestamp={appeal.decision_time} />

      <div className="flex flex-col gap-small padding-top-medium">
        <p className="text-body-medium">{description}</p>

        {abuseTypeChanged && (
          <div
            className="radius-medium bg-shift-100 padding-large stroke-default stroke-standard"
            data-testid="violationUpdateList"
          >
            <EvidenceField
              fieldLabel={translate("Label.Reason")}
              fieldValue={abuseTypes.join(", ") || translate("Label.AbuseType.Other")}
              size="small"
            />
          </div>
        )}

        {isFinal && (
          <span className="text-caption-medium">
            {translate("Description.MaxAppealsHit", { assetType: violation.i18n.contentTypeLower })}
          </span>
        )}
      </div>
    </div>
  );
};

export default AppealRejectedItem;
