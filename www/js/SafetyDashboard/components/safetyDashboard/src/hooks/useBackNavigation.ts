import { useHistory } from "react-router-dom";
import { useCallback } from "react";

/**
 * Returns a back handler. When the user reached the current page by navigating
 * within the app (the history action is a PUSH/REPLACE rather than the POP of an
 * initial load or deep link), pop history so the browser restores their prior
 * scroll position; otherwise invoke `fallback` if provided, or send them to the
 * in-app homepage.
 *
 * We infer this from `history.action` instead of router `location.state`: the app
 * is mounted under a `HashRouter`, whose underlying hash history cannot persist
 * `location.state`, so any `canGoBack` flag pushed alongside a navigation is
 * silently dropped at runtime and the state is always `undefined`.
 */
export const useBackNavigation = (fallback?: () => void): (() => void) => {
  const history = useHistory();

  const handleBack = useCallback(() => {
    if (history.action !== "POP") {
      history.goBack();
    } else if (fallback) {
      fallback();
    } else {
      history.push("/");
    }
  }, [history, fallback]);

  return handleBack;
};
