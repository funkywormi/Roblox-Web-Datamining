import { useCallback, useEffect, useState } from "react";
import { isInMobileSize as isInMobileSizeNow } from "../util/searchLinks";

export default function useUniverseSearchToggle() {
  const isCurrentMobileSize = isInMobileSizeNow();
  const [isInMobileSize, setMobileSize] = useState(isCurrentMobileSize);
  const [isUniverseSearchShown, setUniverseSearchShown] = useState(!isCurrentMobileSize);

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
    window.addEventListener("resize", resizeEventHandler);

    return () => {
      window.removeEventListener("resize", resizeEventHandler);
    };
  }, [resizeEventHandler]);

  return { isUniverseSearchShown, toggleUniverseSearch };
}
