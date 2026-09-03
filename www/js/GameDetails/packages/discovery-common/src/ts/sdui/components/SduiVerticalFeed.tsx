import { VerticalFeed } from "@rbx/discovery-sdui-components";
import React, { useCallback, useMemo } from "react";
import ErrorBoundary from "../../common/components/ErrorBoundary";
import SduiComponent from "../system/SduiComponent";
import { TSduiCommonProps, TServerDrivenComponentConfig } from "../system/SduiTypes";
import logSduiError, { SduiErrorNames } from "../utils/logSduiError";

type SduiVerticalFeedProps = TSduiCommonProps & {
  feedItems: TServerDrivenComponentConfig[];
  maxWidth?: number;
  gapBetweenFeedItems?: number;
  paddingLeft?: number;
  paddingRight?: number;
};

const SduiVerticalFeed = ({
  feedItems,
  analyticsContext,
  sduiContext,
  maxWidth,
  gapBetweenFeedItems,
  paddingLeft,
  paddingRight,
}: SduiVerticalFeedProps): JSX.Element => {
  const { tokens } = sduiContext.dependencies;

  const logErrorBoundaryError = useCallback(
    (errorMessage: string, callstack: string) => {
      logSduiError(
        SduiErrorNames.SduiFeedItemBoundaryError,
        `Error rendering feed item with error message ${errorMessage} and callstack ${callstack}`,
        sduiContext.pageContext,
      );
    },
    [sduiContext.pageContext],
  );

  const feedItemsList = useMemo(() => {
    return feedItems.map((item, index) => ({
      key: item.feedItemKey ?? index.toString(), // Key is needed for React key in the child component. FeedItemKey should exist for most cases since these are feedItems, index is a fallback.
      component: (
        <ErrorBoundary fallback={<React.Fragment />} logError={logErrorBoundaryError}>
          <SduiComponent
            componentConfig={item}
            parentAnalyticsContext={analyticsContext}
            sduiContext={sduiContext}
          />
        </ErrorBoundary>
      ),
    }));
  }, [feedItems, analyticsContext, sduiContext, logErrorBoundaryError]);

  return (
    <VerticalFeed
      feedItems={feedItemsList}
      maxWidth={maxWidth}
      gapBetweenFeedItems={gapBetweenFeedItems ?? tokens.Gap.XXLarge}
      paddingLeft={paddingLeft}
      paddingRight={paddingRight}
    />
  );
};

export default SduiVerticalFeed;
