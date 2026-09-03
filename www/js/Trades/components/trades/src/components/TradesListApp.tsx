import React, { useCallback, useEffect, useState } from "react";
import { TranslationProvider, useTranslation } from "@rbx/core-scripts/react";
import { SystemFeedbackProvider, useSystemFeedback } from "@rbx/core-ui";
import { translations } from "../../component.json";
import {
  TradesRoute,
  TradesRouterProvider,
  buildTradesPath,
  parseTradesRoute,
} from "../tradesRouter";
import usePageViewAnalytics from "../hooks/usePageViewAnalytics";
import { log } from "../utils/logger";
import TradeBanners from "./TradeBanners";
import TradesErrorBoundary from "./TradesErrorBoundary";
import TradesList from "./TradesList";
import TradeRequest from "./TradeRequest";

type SystemFeedbackService = {
  success: (message?: string, timeoutShow?: number, timeoutHide?: number) => void;
  warning: (message?: string, timeoutShow?: number, timeoutHide?: number) => void;
};

/** List view: page-view analytics + banners + the trades list/detail split. */
const ListView = ({
  systemFeedbackService,
}: {
  systemFeedbackService: SystemFeedbackService;
}): JSX.Element => {
  usePageViewAnalytics();
  return (
    <React.Fragment>
      <TradeBanners />
      <TradesList systemFeedbackService={systemFeedbackService} />
    </React.Fragment>
  );
};

const TradesAppInner = (): JSX.Element => {
  const { translate } = useTranslation();
  const { SystemFeedbackComponent, systemFeedbackService } = useSystemFeedback();
  const [route, setRoute] = useState<TradesRoute>(() => parseTradesRoute() ?? { view: "list" });

  const navigate = useCallback((next: TradesRoute) => {
    const path = buildTradesPath(next);
    log("navigate ->", next, "path:", path);
    window.history.pushState(null, "", path);
    setRoute(next);
  }, []);

  // Keep view state in sync with browser back/forward navigation.
  useEffect(() => {
    const handlePopState = () => {
      const next = parseTradesRoute() ?? { view: "list" };
      log("popstate ->", next);
      setRoute(next);
    };
    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  log("render app view:", route.view, route);

  return (
    <TradesRouterProvider value={{ route, navigate }}>
      <TradesErrorBoundary fallbackMessage={translate("Error.FailedToLoadTradesList")}>
        {route.view === "list" ? (
          <ListView systemFeedbackService={systemFeedbackService} />
        ) : (
          <TradeRequest route={route} systemFeedbackService={systemFeedbackService} />
        )}
      </TradesErrorBoundary>
      <SystemFeedbackComponent />
      {/* Container the 2SV challenge renders into (see useTwoStepVerification). */}
      <div id="2sv-popup-container" />
    </TradesRouterProvider>
  );
};

/** Root of the React trades app: translation + system-feedback providers. */
export const TradesListApp = (): JSX.Element => (
  <TranslationProvider config={translations}>
    <SystemFeedbackProvider>
      <TradesAppInner />
    </SystemFeedbackProvider>
  </TranslationProvider>
);

export default TradesListApp;
