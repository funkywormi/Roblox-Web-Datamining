import { Dispatch, SetStateAction, useEffect } from "react";
import { isEqual } from "lodash";
import { isStringNumberOrBooleanValue, parseStringField } from "../utils/analyticsParsingUtils";
import {
  SduiPresenceConditionKey,
  TSduiConditionalPropSet,
  TSduiContext,
  TSduiSocialData,
} from "./SduiTypes";
import logSduiError, { SduiErrorNames } from "../utils/logSduiError";

const checkPresenceCondition = (
  conditionKey: SduiPresenceConditionKey,
  conditionValue: unknown,
  sduiSocialData: TSduiSocialData,
  sduiContext: TSduiContext,
): boolean => {
  switch (conditionKey) {
    case SduiPresenceConditionKey.friendInGame: {
      if (!isStringNumberOrBooleanValue(conditionValue)) {
        logSduiError(
          SduiErrorNames.InvalidPresenceConditionValue,
          `Invalid presence condition value: ${JSON.stringify(
            conditionValue,
          )}, for key: ${conditionKey}`,
          sduiContext.pageContext,
        );

        return false;
      }

      const universeId = parseStringField(conditionValue, "");

      if (!universeId) {
        logSduiError(
          SduiErrorNames.InvalidPresenceConditionValue,
          `Invalid friend in game condition value: ${JSON.stringify(
            conditionValue,
          )}, for key: ${conditionKey}`,
          sduiContext.pageContext,
        );

        return false;
      }

      const inGameFriends = sduiSocialData.inGameFriendsByUniverseId[universeId];
      return inGameFriends != null && inGameFriends.length > 0;
    }
    default: {
      logSduiError(
        SduiErrorNames.UnknownPresenceConditionKey,
        `Unknown presence condition key: ${JSON.stringify(conditionKey)}`,
        sduiContext.pageContext,
      );

      return false;
    }
  }
};

const SDUI_PRESENCE_CONDITION_KEYS = Object.keys(SduiPresenceConditionKey);

export const isPresenceConditionKey = (
  conditionKey: string,
): conditionKey is SduiPresenceConditionKey => {
  return SDUI_PRESENCE_CONDITION_KEYS.includes(conditionKey);
};

export type TSduiPresenceConditionDetectorProps = {
  conditionalProps: TSduiConditionalPropSet[] | undefined;
  setFailedPresenceConditionIndexes: Dispatch<SetStateAction<Set<number>>>;
  sduiContext: TSduiContext;
};

const SduiPresenceConditionDetector = ({
  conditionalProps,
  setFailedPresenceConditionIndexes,
  sduiContext,
}: TSduiPresenceConditionDetectorProps): null => {
  useEffect(() => {
    const newFailedPresenceConditionIndexes = new Set<number>();

    conditionalProps?.forEach(
      (conditionalPropSet: TSduiConditionalPropSet, propSetIndex: number) => {
        const { conditions } = conditionalPropSet;

        if (conditions) {
          Object.entries(conditions).forEach(([conditionKey, conditionValue]) => {
            if (isPresenceConditionKey(conditionKey)) {
              const isConditionMet = checkPresenceCondition(
                conditionKey,
                conditionValue,
                sduiContext.dataStore.social,
                sduiContext,
              );

              if (!isConditionMet) {
                newFailedPresenceConditionIndexes.add(propSetIndex);
              }
            }
          });
        }
      },
    );

    // Only update state if the new value is different
    setFailedPresenceConditionIndexes(prevFailedPresenceConditionIndexes => {
      if (!isEqual(prevFailedPresenceConditionIndexes, newFailedPresenceConditionIndexes)) {
        return newFailedPresenceConditionIndexes;
      }

      return prevFailedPresenceConditionIndexes;
    });
  }, [conditionalProps, sduiContext, setFailedPresenceConditionIndexes]);

  return null;
};

export default SduiPresenceConditionDetector;
