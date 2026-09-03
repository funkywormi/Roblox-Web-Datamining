import React, { useMemo } from "react";
import { TAnalyticsContext, TRenderedSduiComponentConfig, TSduiContext } from "../system/SduiTypes";
import logSduiError, { SduiErrorNames } from "../utils/logSduiError";

const useWrapCollectionChildrenWithAnalyticsContext = (
  collectionAnalyticsContext: TAnalyticsContext,
  componentConfig: TRenderedSduiComponentConfig,
  sduiContext: TSduiContext,
  children?: React.ReactNode[],
): React.ReactNode => {
  // Attach updated context with logAction and getCollectionData to arbitrary children
  return useMemo(() => {
    return React.Children.map(children, (child: React.ReactNode, childIndex: number) => {
      if (!React.isValidElement(child)) {
        logSduiError(
          SduiErrorNames.CollectionComponentChildNotReactElement,
          `${componentConfig.componentType} with config ${JSON.stringify(
            componentConfig,
          )} has child ${JSON.stringify(child)} that is not a valid React element`,
          sduiContext.pageContext,
        );

        return child;
      }

      const id = `${componentConfig.componentType}-child-${childIndex}`;

      return React.cloneElement(child, {
        ...child.props,
        key: id,
        parentAnalyticsContext: collectionAnalyticsContext,
      });
    });
  }, [children, collectionAnalyticsContext, componentConfig, sduiContext]);
};

export default useWrapCollectionChildrenWithAnalyticsContext;
