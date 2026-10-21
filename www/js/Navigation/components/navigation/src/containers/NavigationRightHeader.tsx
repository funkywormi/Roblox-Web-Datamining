import React, { useEffect } from "react";
import UniversalSearchContainer from "./UniversalSearch";
import HeaderRightNav from "../components/HeaderRightNav";
import useUniverseSearchToggle from "../hooks/useUniverseSearchToggle";
import { trackRendered } from "../topNav/observability";

export default function NavigationRightHeader() {
  const { isUniverseSearchShown, toggleUniverseSearch } = useUniverseSearchToggle();

  // Not in NavigationRobux: it mounts twice and would double-log.
  useEffect(() => {
    trackRendered();
  }, []);

  return (
    <React.Fragment>
      <UniversalSearchContainer isUniverseSearchShown={isUniverseSearchShown} />
      <HeaderRightNav toggleUniverseSearch={toggleUniverseSearch} />
    </React.Fragment>
  );
}
