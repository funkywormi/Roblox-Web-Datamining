import { PUNISHMENT_TYPE, VIOLATION_TYPE_TO_PLURAL_MAP } from "./constants";
import type { TranslateFunction } from "../providers/types";

/**
 * Determines the punishment description based on the violations reasons and violation type. If neither the violation
 * type nor an abuse type is present, we fallback to the generic string.
 *
 * If the intervention type is deleted, we always show the banned message.
 *
 * Ex:
 * - (violationType present, violationReasons present): One of your images broke the rules against: spam, harassment.
 * - (violationType present, violationReasons not present): One of your images broke the rules of our community.
 * - (violationType not present, violationReasons present): Your behavior broke the rules against: spam.
 * - (violationType not present, violationReasons not present): Your behavior broke the rules of our community.
 * - (deleted): We banned your account because of repeated or serious rule-breaking.
 */
function determinePunishmentDescription(
  violationReasons: string[],
  violationType: string | undefined,
  interventionType: PUNISHMENT_TYPE,
  translate: TranslateFunction,
): string {
  if (interventionType === PUNISHMENT_TYPE.Delete) {
    return translate("Description.BrokeRulesBanned");
  }

  const pluralViolationType = VIOLATION_TYPE_TO_PLURAL_MAP[violationType ?? ""];
  const translatedViolationType = pluralViolationType ? translate(pluralViolationType) : "";

  if (violationReasons.length > 0) {
    return translatedViolationType
      ? translate("Description.BrokeRulesTypePolicy.V2", {
          type: translatedViolationType,
          policy: violationReasons.join(", ").toLowerCase(),
        })
      : translate("Description.BrokeRulesPolicy.V2", {
          policy: violationReasons.join(", ").toLowerCase(),
        });
  }

  return translatedViolationType
    ? translate("Description.BrokeRulesType", {
        type: translatedViolationType,
      })
    : translate("Description.BrokeRulesGeneric");
}

export default determinePunishmentDescription;
