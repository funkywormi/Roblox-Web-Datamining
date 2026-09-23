import React, { useState, useEffect, useCallback } from "react";
import UniversalSearchContainer from "./UniversalSearch";
import HeaderRightNav from "../components/HeaderRightNav";
import { isInMobileSize as isInMobileSizeNow } from "../util/navigationUtil";
import { logTopNavFoundationExposureIfEnrolled } from "../util/topNavFoundationIxp";

export default function NavigationRightHeader() {
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

  // Not in NavigationRobux: it mounts twice and would double-log.
  useEffect(() => {
    logTopNavFoundationExposureIfEnrolled();
  }, []);

  useEffect(() => {
    window.addEventListener("resize", resizeEventHandler);

    return () => {
      window.removeEventListener("resize", resizeEventHandler);
    };
  }, [resizeEventHandler]);

  return (
    <React.Fragment>
      <UniversalSearchContainer isUniverseSearchShown={isUniverseSearchShown} />
      <HeaderRightNav toggleUniverseSearch={toggleUniverseSearch} />
    </React.Fragment>
  );
}
