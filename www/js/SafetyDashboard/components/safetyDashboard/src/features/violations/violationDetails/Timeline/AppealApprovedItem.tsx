import { useTranslation } from "@rbx/core-scripts/react";
import { Appeal } from "../../util/violations";
import Timestamp from "../Timestamp";
import getFilteredAbuseTypes from "../../util/getFilteredAbuseTypes";

/**
 * We need to use different translations depending on the number of abuse types for the
 * violation. We only show up to 3 abuse types (i.e. if there are more than 3, we only show
 * the first three and the rest can only be seen in the "What happened" section).
 */
const getApprovalDescription = (
  abuseTypes: string[],
  translate: (key: string, params?: Record<string, string>) => string,
): string => {
  const [first, second, third] = abuseTypes;

  if (abuseTypes.length === 0 || !first) {
    return translate("Description.AppealAccepted.None");
  }

  if (abuseTypes.length === 1 || !second) {
    return translate("Description.AppealAccepted.V2", { violations: first });
  }

  return translate("Description.AppealAccepted.Multiple", {
    violationsList: third ? `${first}, ${second}` : first,
    singleViolation: third ?? second,
  });
};

/**
 * Shown on the appeal timeline when an appeal is approved and a user's violation
 * has been revsersed.
 */
const AppealApprovedItem = ({ appeal }: { appeal: Appeal }) => {
  const { translate } = useTranslation();

  const abuseTypes = getFilteredAbuseTypes(appeal.abuse_type_keys, translate);
  const description = getApprovalDescription(abuseTypes, translate);

  return (
    <div className="flex flex-col gap-xxsmall">
      <span className="text-title-medium">{translate("Header.AppealAccepted")}</span>
      <Timestamp timestamp={appeal.decision_time} />

      <p className="text-body-medium padding-top-medium">{description}</p>
    </div>
  );
};

export default AppealApprovedItem;
