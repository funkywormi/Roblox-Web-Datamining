import { useCallback } from "react";
import { useLocation, useHistory } from "react-router-dom";
import { supportRootURLProd } from "../core/helpers/supportEnvironment";

interface UseNavReturn {
  pushToParent: () => void;
  pushSegment: (newSegment: string) => void;
}

const useNav = (): UseNavReturn => {
  const location = useLocation();
  const history = useHistory();

  const pushToParent = useCallback(() => {
    const url = new URL(location.pathname, supportRootURLProd);
    const segments = url.pathname.split("/").filter(Boolean);
    segments.pop();
    const newPath = `/${segments.join("/")}`;
    history.push(newPath || "/");
  }, [location, history]);

  const pushSegment = useCallback(
    (newSegment: string) => {
      if (!newSegment) return;
      history.push(newSegment);
    },
    [history],
  );

  return { pushToParent, pushSegment };
};

export default useNav;
