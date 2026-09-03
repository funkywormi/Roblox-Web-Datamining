import type { TranslateFunction } from "@rbx/core-scripts/react";
import serverListConstants from "../constants/serverListConstants";

const { economicRestrictionLabel } = serverListConstants;

type EconomicRestrictionKey = keyof typeof economicRestrictionLabel;
const isEconomicRestrictionKey = (violation: string): violation is EconomicRestrictionKey =>
  violation in economicRestrictionLabel;

const getViolationLabel = (violation: string) =>
  isEconomicRestrictionKey(violation)
    ? economicRestrictionLabel[violation]
    : "Label.Sublabel.FraudPaymentAbuse";

const getEconomicRestrictionErrorMsg = (
  translate: TranslateFunction,
  violation: string,
  timeoutDurationInMinutes: number,
) => {
  const timeoutInHours = Math.ceil(timeoutDurationInMinutes / 60);
  if (timeoutInHours > 24) {
    const timeoutInDays = Math.ceil(timeoutInHours / 24);
    return translate("Text.EconomicRestrictionsDaysGeneral", {
      violation: translate(getViolationLabel(violation)),
      day: timeoutInDays,
    });
  }
  return translate("Text.EconomicRestrictionsHoursGeneral", {
    violation: translate(getViolationLabel(violation)),
    hour: timeoutInHours,
  });
};

export default getEconomicRestrictionErrorMsg;
