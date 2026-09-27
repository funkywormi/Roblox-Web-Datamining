import React from "react";
import { Redirect, Route, Switch } from "react-router-dom";
import { baseParentalControlsPath } from "../../../constants/parentalControls/parentalControlsConstants";
import { parentZonePages } from "../../../constants/parentalControls/parentZonePages";
import { useGetOdpChildContextQuery } from "../../../../apis/parentalControlsApi";
import TopGames from "../parentDashboard/TopGames";
import ManageOnDeviceParentPage from "../parentZone/ManageOnDeviceParentPage";

// Parent Zone subpages. A page is only reachable while its flag is on, so a link to a page the
// server has turned off redirects back to the landing page instead.
export const ParentZoneRoutes = (): JSX.Element => {
  const { data: odpChildContext, isLoading, isUninitialized } = useGetOdpChildContextQuery();
  const isChildContextSettled = !isLoading && !isUninitialized;

  return (
    <Switch>
      {odpChildContext?.canParentManageChildsExperiences === true && (
        <Route exact path={parentZonePages.topGamesPage.path}>
          {/* No child, so a row opens the experience rather than the parent's own page. */}
          <TopGames isParentFacing />
        </Route>
      )}

      <Route exact path={parentZonePages.manageOnDeviceParentPage.path}>
        <ManageOnDeviceParentPage />
      </Route>

      {isChildContextSettled && (
        <Route path={`${baseParentalControlsPath}/*`}>
          <Redirect to={baseParentalControlsPath} />
        </Route>
      )}
    </Switch>
  );
};

export default ParentZoneRoutes;
