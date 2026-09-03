import { NAPageItemConfigType } from "./ConfigTypes";
import ViolationPageItemConfig from "./configs/ViolationPageItemConfig";
import BadUtterancesPageItemConfig from "./configs/BadUtterancesPageItemConfig";
import SimpleEvidencePageItemConfig from "./configs/SimpleEvidencePageItemConfig";

/**
 * Nested page item options for the ReviewedEvidencePageItemConfig. Keeping this function here in
 * order to avoid circular dependencies.
 */
export const getReviewedEvidencePageItemConfigs = (): NAPageItemConfigType[] => {
  return [ViolationPageItemConfig, BadUtterancesPageItemConfig, SimpleEvidencePageItemConfig];
};
