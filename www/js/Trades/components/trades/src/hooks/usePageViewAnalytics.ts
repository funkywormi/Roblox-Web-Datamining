import { useEffect, useRef } from "react";
import { authenticatedUser } from "@rbx/core-scripts/meta/user";
import tradesConstants from "../constants/tradesConstants";
import { hasTradableItems } from "../services/tradesApi";
import { sendAXEvent, tradeEvents } from "../services/tradeEvents";
import getEntryContext from "../utils/tradeEntryContext";

const FIRST_VISIT_LOCAL_STORAGE_KEY = "rbx.trades.hasVisitedTradeCenter";

// Records the trades-list page view exactly once per mount, plus the
// once-per-user first-visit funnel event. Port of the page-view logic in the
// Angular tradesController.
const consumeFirstVisit = (): boolean => {
  try {
    if (!window.localStorage) {
      return false;
    }
    if (window.localStorage.getItem(FIRST_VISIT_LOCAL_STORAGE_KEY) === "true") {
      return false;
    }
    window.localStorage.setItem(FIRST_VISIT_LOCAL_STORAGE_KEY, "true");
    return true;
  } catch {
    return false;
  }
};

export const usePageViewAnalytics = (): void => {
  const firedRef = useRef(false);

  useEffect(() => {
    if (firedRef.current) {
      return;
    }
    firedRef.current = true;

    const entryContext = getEntryContext();
    const isFirstVisit = consumeFirstVisit();

    sendAXEvent(tradeEvents.pageView, "tradesList", {
      state: tradesConstants.states.tradesList,
      referrer: entryContext.referrer,
      entrySource: entryContext.entrySource,
      isFirstVisit,
    });

    if (isFirstVisit) {
      hasTradableItems(authenticatedUser()?.id!)
        .then(ownsLimiteds => {
          sendAXEvent(tradeEvents.firstVisit, "tradesList", {
            entrySource: entryContext.entrySource,
            ownsLimiteds,
          });
        })
        .catch(() => undefined);
    }
  }, []);
};

export default usePageViewAnalytics;
