import { useEffect, useState } from "react";
import { window } from "@rbx/core-lib/browser";
import {
  buildHashRoute,
  getHashbangRewrite,
  parseHashRoute,
  type HashRoute,
} from "../utils/hashRoute";

const readRoute = (): HashRoute | null => parseHashRoute(window?.location.hash ?? "");

const isSameRoute = (left: HashRoute | null, right: HashRoute | null) =>
  left?.categoryName === right?.categoryName && left?.subcategoryName === right?.subcategoryName;

const useHashRoute = (defaultCategory: string): HashRoute | null => {
  const [route, setRoute] = useState<HashRoute | null>(readRoute);

  useEffect(() => {
    const browserWindow = window;
    if (!browserWindow) {
      return undefined;
    }

    const update = (next: HashRoute | null) => {
      setRoute(previous => (isSameRoute(previous, next) ? previous : next));
    };

    const sync = () => {
      const current = readRoute();
      if (current) {
        update(current);
        return;
      }
      const rewrite = getHashbangRewrite(browserWindow.location.href);
      if (rewrite) {
        browserWindow.location.href = rewrite;
        return;
      }
      browserWindow.history.replaceState(
        browserWindow.history.state,
        "",
        buildHashRoute({ categoryName: defaultCategory }),
      );
      update(readRoute());
    };

    sync();
    browserWindow.addEventListener("hashchange", sync);
    return () => {
      browserWindow.removeEventListener("hashchange", sync);
    };
  }, [defaultCategory]);

  return route;
};

export default useHashRoute;
