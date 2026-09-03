import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { isEqual } from "lodash";
import { SduiResponsiveConditionKey, TSduiConditionalPropSet, TSduiContext } from "./SduiTypes";
import { checkResponsiveCondition } from "./extractResponsivePropOverrides";

const SDUI_RESPONSIVE_CONDITION_KEYS = Object.keys(SduiResponsiveConditionKey);

export const isResponsiveConditionKey = (
  conditionKey: string,
): conditionKey is SduiResponsiveConditionKey => {
  return SDUI_RESPONSIVE_CONDITION_KEYS.includes(conditionKey);
};

export type TSduiResponsiveConditionDetectorProps = {
  conditionalProps: TSduiConditionalPropSet[] | undefined;
  setFailedResponsiveConditionIndexes: Dispatch<SetStateAction<Set<number>>>;
  sduiContext: TSduiContext;
};

const SduiResponsiveConditionDetector = ({
  conditionalProps,
  setFailedResponsiveConditionIndexes,
  sduiContext,
}: TSduiResponsiveConditionDetectorProps): null => {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    const newFailedResponsiveConditionIndexes = new Set<number>();

    conditionalProps?.forEach(
      (conditionalPropSet: TSduiConditionalPropSet, propSetIndex: number) => {
        const { conditions } = conditionalPropSet;

        if (conditions) {
          Object.entries(conditions).forEach(([conditionKey, conditionValue]) => {
            if (isResponsiveConditionKey(conditionKey)) {
              const isConditionMet = checkResponsiveCondition(
                conditionKey,
                conditionValue,
                windowWidth,
                sduiContext,
              );

              if (!isConditionMet) {
                newFailedResponsiveConditionIndexes.add(propSetIndex);
              }
            }
          });
        }
      },
    );

    // Only update state if the new value is different
    setFailedResponsiveConditionIndexes(prevFailedResponsiveConditionIndexes => {
      if (!isEqual(prevFailedResponsiveConditionIndexes, newFailedResponsiveConditionIndexes)) {
        return newFailedResponsiveConditionIndexes;
      }

      return prevFailedResponsiveConditionIndexes;
    });
  }, [conditionalProps, setFailedResponsiveConditionIndexes, windowWidth, sduiContext]);

  return null;
};

export default SduiResponsiveConditionDetector;
