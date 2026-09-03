import React, { useCallback, useMemo } from "react";
import { TOmniRecommendationSduiSort } from "../common/types/bedev2Types";
import SduiComponent from "../sdui/system/SduiComponent";
import { TOmniRecommendationSduiTree, TSduiPageContextType } from "../sdui/system/SduiTypes";
import { extractValidSduiFeedItem } from "../sdui/system/SduiParsers";
import ErrorBoundary from "../common/components/ErrorBoundary";
import logSduiError, { SduiErrorNames } from "../sdui/utils/logSduiError";
import { usePageSession } from "../common/utils/PageSessionContext";
import { buildSessionAnalyticsData } from "../sdui/utils/analyticsParsingUtils";
import useSduiContext from "../sdui/hooks/useSduiContext";
import "../sdui/style/_sduiIcons.scss";

type TSduiFeedItemProps = {
  sort: TOmniRecommendationSduiSort;
  sduiRoot: TOmniRecommendationSduiTree | undefined;
  currentPage: TSduiPageContextType;
};

/**
 * Renders a single feed item using Server Driven UI
 *
 * Uses the feedItemKey to match the feed item in the sdui root to the
 * current sort being rendered in order of the response.
 */
const SduiFeedItem = ({ sort, sduiRoot, currentPage }: TSduiFeedItemProps): JSX.Element => {
  const pageSessionInfo = usePageSession();

  const sduiContext = useSduiContext(sduiRoot?.templates, currentPage);

  const content = useMemo(() => {
    const sduiFeedItem = extractValidSduiFeedItem(sduiRoot, sort.feedItemKey, sduiContext);

    if (!sduiFeedItem) {
      // Error logging is handled during extraction
      return <React.Fragment />;
    }

    const localAnalyticsData = {
      ...buildSessionAnalyticsData(pageSessionInfo, sduiContext.pageContext),
    };

    return (
      <div className="sdui-feed-item-container">
        <SduiComponent
          componentConfig={sduiFeedItem}
          parentAnalyticsContext={{}}
          localAnalyticsData={localAnalyticsData}
          sduiContext={sduiContext}
        />
      </div>
    );
  }, [sort, sduiRoot, pageSessionInfo, sduiContext]);

  const logErrorBoundaryError = useCallback(
    (errorMessage: string, callstack: string) => {
      logSduiError(
        SduiErrorNames.SduiFeedItemBoundaryError,
        `Error rendering feed item for sort ${JSON.stringify(sort)} and sdui root ${JSON.stringify(
          sduiRoot,
        )} with error message ${errorMessage} and callstack ${callstack}`,
        sduiContext.pageContext,
      );
    },
    [sort, sduiRoot, sduiContext.pageContext],
  );

  return (
    <ErrorBoundary fallback={<React.Fragment />} logError={logErrorBoundaryError}>
      {content}
    </ErrorBoundary>
  );
};

export default SduiFeedItem;
