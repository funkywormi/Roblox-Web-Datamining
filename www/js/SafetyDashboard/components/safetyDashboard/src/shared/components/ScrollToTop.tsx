import { useEffect } from "react";
import { useHistory, useLocation } from "react-router-dom";

/**
 * Resets window scroll to the top on forward navigations (PUSH/REPLACE). POP
 * (browser back/forward, and our in-app goBack) is skipped so the browser's
 * native scroll restoration keeps the user's previous position.
 */
const ScrollToTop = () => {
  const { pathname } = useLocation();
  const history = useHistory();

  useEffect(() => {
    if (history.action !== "POP") {
      window.scrollTo(0, 0);
    }
  }, [pathname, history.action]);

  return null;
};

export default ScrollToTop;
