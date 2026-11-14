import { useCallback, useEffect, useState } from "react";
import { isInMobileSize as isInMobileSizeNow } from "../util/searchLinks";

export default function useUniverseSearchToggle() {
  // Starts as mobile so the server and hydration render agree; `shown` only changes the layout at
  // mobile widths, so desktop looks the same until the effect measures the window.
  const [isInMobileSize, setMobileSize] = useState(true);
  const [isUniverseSearchShown, setUniverseSearchShown] = useState(false);

  const toggleUniverseSearch = () => {
    setUniverseSearchShown(isShown => !isShown);
  };

  const resizeEventHandler = useCallback(() => {
    const isCurrentWindowMobileSize = isInMobileSizeNow();
    if (isInMobileSize !== isCurrentWindowMobileSize) {
      setMobileSize(isCurrentWindowMobileSize);
      setUniverseSearchShown(!isCurrentWindowMobileSize);
    }
  }, [isInMobileSize]);

  useEffect(() => {
    resizeEventHandler();
    window.addEventListener("resize", resizeEventHandler);

    return () => {
      window.removeEventListener("resize", resizeEventHandler);
    };
  }, [resizeEventHandler]);

  return { isUniverseSearchShown, toggleUniverseSearch };
}
