import { PUNISHMENT_TYPE } from "./constants";

function isBanType(punishmentTypeDescription: PUNISHMENT_TYPE): boolean {
  const isValidPunishmentType = Object.values(PUNISHMENT_TYPE).includes(punishmentTypeDescription);
  return isValidPunishmentType && punishmentTypeDescription.startsWith("Ban");
}

export default isBanType;
