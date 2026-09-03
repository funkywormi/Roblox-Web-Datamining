import React, { useMemo } from "react";
import { TAnalyticsContext } from "../system/SduiTypes";

const useWrapWithAnalyticsContext = (
  analyticsContext: TAnalyticsContext,
  element?: JSX.Element,
): JSX.Element | null => {
  return useMemo(() => {
    if (!element) {
      return null;
    }

    return React.cloneElement(element, {
      ...element.props,
      parentAnalyticsContext: analyticsContext,
    });
  }, [element, analyticsContext]);
};

export default useWrapWithAnalyticsContext;
