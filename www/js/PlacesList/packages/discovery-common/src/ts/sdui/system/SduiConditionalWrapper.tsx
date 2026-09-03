import React, { useCallback, useMemo, useState } from "react";
import { TSduiComponentWrapperProps } from "./wrapComponentForSdui";
import {
  SduiPresenceConditionKey,
  SduiResponsiveConditionKey,
  TSduiConditionalPropConditions,
  TSduiConditionalPropSet,
} from "./SduiTypes";
import SduiPresenceConditionDetector, {
  isPresenceConditionKey,
} from "./SduiPresenceConditionDetector";
import SduiResponsiveConditionDetector, {
  isResponsiveConditionKey,
} from "./SduiResponsiveConditionDetector";
import logSduiError, { SduiErrorNames } from "../utils/logSduiError";

export type TSduiConditionalWrapperProps = {
  wrappedComponent: React.ComponentType<TSduiComponentWrapperProps>;
} & TSduiComponentWrapperProps;

const SduiConditionalWrapper = ({
  wrappedComponent,
  componentConfig,
  parentAnalyticsContext,
  sduiContext,
  localAnalyticsData,
  extraLocalProps,
}: TSduiConditionalWrapperProps): JSX.Element => {
  const { conditionalProps } = componentConfig;

  const [failedResponsiveConditionIndexes, setFailedResponsiveConditionIndexes] = useState<
    Set<number>
  >(new Set());
  const [failedPresenceConditionIndexes, setFailedPresenceConditionIndexes] = useState<Set<number>>(
    new Set(),
  );

  const neededDetectors: {
    hasPresenceCondition: boolean;
    hasResponsiveCondition: boolean;
  } = useMemo(() => {
    const result = {
      hasPresenceCondition: false,
      hasResponsiveCondition: false,
    };

    if (!conditionalProps) {
      return result;
    }

    const presenceKeys = Object.keys(SduiPresenceConditionKey);
    const responsiveKeys = Object.keys(SduiResponsiveConditionKey);

    conditionalProps.forEach(conditionalPropSet => {
      const { conditions } = conditionalPropSet;

      if (conditions) {
        Object.keys(conditions).forEach(key => {
          if (presenceKeys.includes(key)) {
            result.hasPresenceCondition = true;
          } else if (responsiveKeys.includes(key)) {
            result.hasResponsiveCondition = true;
          }
        });
      }
    });

    return result;
  }, [conditionalProps]);

  const detectors: JSX.Element = useMemo(() => {
    return (
      <React.Fragment>
        {neededDetectors.hasPresenceCondition && (
          <SduiPresenceConditionDetector
            conditionalProps={conditionalProps}
            setFailedPresenceConditionIndexes={setFailedPresenceConditionIndexes}
            sduiContext={sduiContext}
          />
        )}
        {neededDetectors.hasResponsiveCondition && (
          <SduiResponsiveConditionDetector
            conditionalProps={conditionalProps}
            setFailedResponsiveConditionIndexes={setFailedResponsiveConditionIndexes}
            sduiContext={sduiContext}
          />
        )}
      </React.Fragment>
    );
  }, [neededDetectors, conditionalProps, sduiContext]);

  const areConditionsMet = useCallback(
    (conditions: TSduiConditionalPropConditions | undefined, propSetIndex: number) => {
      if (
        failedPresenceConditionIndexes.has(propSetIndex) ||
        failedResponsiveConditionIndexes.has(propSetIndex)
      ) {
        return false;
      }

      if (!conditions) {
        return true;
      }

      // Ensure that all conditions are met to apply the overrides
      return Object.keys(conditions).every(conditionKey => {
        if (isPresenceConditionKey(conditionKey) || isResponsiveConditionKey(conditionKey)) {
          // Any failure is handled by the failedConditionIndexes check above
          return true;
        }

        // Unsupported condition, assume it is not met
        logSduiError(
          SduiErrorNames.UnsupportedConditionalPropsCondition,
          `Unsupported condition: ${conditionKey}`,
          sduiContext.pageContext,
        );

        return false;
      });
    },
    [failedPresenceConditionIndexes, failedResponsiveConditionIndexes, sduiContext.pageContext],
  );

  const conditionalPropOverrides = useMemo(() => {
    if (!conditionalProps) {
      return {};
    }

    return conditionalProps.reduce<Record<string, unknown>>(
      (acc, conditionalPropSet: TSduiConditionalPropSet, propSetIndex: number) => {
        const { conditions, propOverrides } = conditionalPropSet;

        if (propOverrides) {
          if (areConditionsMet(conditions, propSetIndex)) {
            return {
              ...acc,
              ...propOverrides,
            };
          }
        }

        return acc;
      },
      {},
    );
  }, [conditionalProps, areConditionsMet]);

  const derivedComponent = useMemo(() => {
    return React.createElement(wrappedComponent, {
      componentConfig,
      parentAnalyticsContext,
      sduiContext,
      localAnalyticsData,
      extraLocalProps,
      conditionalPropOverrides,
    });
  }, [
    wrappedComponent,
    componentConfig,
    parentAnalyticsContext,
    sduiContext,
    localAnalyticsData,
    extraLocalProps,
    conditionalPropOverrides,
  ]);

  return (
    <React.Fragment>
      {derivedComponent}
      {detectors}
    </React.Fragment>
  );
};

export default SduiConditionalWrapper;
