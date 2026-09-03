import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import RouterPath from "../../../enums/RouterPath";

// Dummy component so that mobile dropdown is set correctly based on the current path
// It is hacky and breaks the routing abstraction
// But it's temporary as we will be updating the settings navigation very soon (tm)
const MobileDropdownNameUpdater = ({
  setCurrMobileTab,
}: {
  setCurrMobileTab: (path: RouterPath) => void;
}): JSX.Element => {
  const location = useLocation();

  useEffect(() => {
    const currentPath = location.pathname.split("/")[1];
    setCurrMobileTab(currentPath as RouterPath);
  }, [location]);

  return <React.Fragment />;
};

export default MobileDropdownNameUpdater;
