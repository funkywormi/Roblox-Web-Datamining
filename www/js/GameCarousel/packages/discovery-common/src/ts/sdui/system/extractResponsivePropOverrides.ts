import logSduiError, { SduiErrorNames } from "../utils/logSduiError";
import {
  isStringNumberOrBooleanValue,
  parseMaybeStringNumberField,
  parseStringField,
} from "../utils/analyticsParsingUtils";
import { SduiResponsiveConditionKey, TSduiContext, TSduiResponsiveConfig } from "./SduiTypes";

const imageQualityToLevelMap: Record<string, number> = {
  low: 1,
  Low: 1,
  medium: 2,
  Medium: 2,
  high: 3,
  High: 3,
};

// Web always has an Image Quality Level of High
const webImageQualityLevel = imageQualityToLevelMap.High;

export const checkResponsiveCondition = (
  conditionKey: string,
  conditionValue: unknown,
  windowWidth: number,
  sduiContext: TSduiContext,
): boolean => {
  switch (conditionKey) {
    case SduiResponsiveConditionKey.imageQualityLevel: {
      if (!isStringNumberOrBooleanValue(conditionValue)) {
        logSduiError(
          SduiErrorNames.InvalidImageQualityLevelConditionValue,
          `Invalid image quality level value: ${
            conditionValue ? JSON.stringify(conditionValue) : "undefined"
          }`,
          sduiContext.pageContext,
        );
        return false;
      }

      const conditionImageQualityLevel =
        imageQualityToLevelMap[parseStringField(conditionValue, "")];

      if (conditionImageQualityLevel === undefined) {
        logSduiError(
          SduiErrorNames.UnknownImageQualityLevelConditionValue,
          `Unknown image quality level: ${conditionValue.toString()}`,
          sduiContext.pageContext,
        );
        return false;
      }

      return webImageQualityLevel === conditionImageQualityLevel;
    }
    case SduiResponsiveConditionKey.maxScreenWidth: {
      if (!isStringNumberOrBooleanValue(conditionValue)) {
        logSduiError(
          SduiErrorNames.InvalidMaxWidthConditionValue,
          `Invalid max width condition value: ${
            conditionValue ? JSON.stringify(conditionValue) : "undefined"
          }`,
          sduiContext.pageContext,
        );
        return false;
      }

      const maxAllowedWidth = parseMaybeStringNumberField(conditionValue, -1);

      if (maxAllowedWidth < 0) {
        logSduiError(
          SduiErrorNames.InvalidParsedMaxWidthConditionValue,
          `Cannot parse max width value: ${conditionValue.toString()}`,
          sduiContext.pageContext,
        );
        return false;
      }

      return maxAllowedWidth >= windowWidth;
    }
    case SduiResponsiveConditionKey.minScreenWidth: {
      if (!isStringNumberOrBooleanValue(conditionValue)) {
        logSduiError(
          SduiErrorNames.InvalidMinWidthConditionValue,
          `Invalid min width condition value: ${
            conditionValue ? JSON.stringify(conditionValue) : "undefined"
          }`,
          sduiContext.pageContext,
        );
        return false;
      }

      const minAllowedWidth = parseMaybeStringNumberField(conditionValue, -1);

      if (minAllowedWidth < 0) {
        logSduiError(
          SduiErrorNames.InvalidParsedMinWidthConditionValue,
          `Cannot parse min width value: ${conditionValue.toString()}`,
          sduiContext.pageContext,
        );
        return false;
      }

      return minAllowedWidth <= windowWidth;
    }
    default: {
      logSduiError(
        SduiErrorNames.UnknownResponsivePropConditionKey,
        `Unknown responsive prop condition key: ${JSON.stringify(conditionKey)}`,
        sduiContext.pageContext,
      );
      return false;
    }
  }
};

/**
 * Extracts the first set of prop overrides that meet the conditions from the responsiveProps array, or {}
 */
const extractResponsivePropOverrides = (
  responsiveProps: TSduiResponsiveConfig[] | undefined,
  windowWidth: number,
  sduiContext: TSduiContext,
): Record<string, unknown> => {
  if (!responsiveProps) {
    return {};
  }

  // Find first responsive prop config where all of the conditions are met, or there are no conditions
  const firstConfigWithConditionsMet = responsiveProps.find(responsivePropConfig => {
    const { conditions } = responsivePropConfig;

    if (!conditions) {
      return true;
    }

    return Object.entries(conditions).every(([conditionKey, conditionValue]) => {
      return checkResponsiveCondition(conditionKey, conditionValue, windowWidth, sduiContext);
    });
  });

  return firstConfigWithConditionsMet ? firstConfigWithConditionsMet.overrides : {};
};

export default extractResponsivePropOverrides;
