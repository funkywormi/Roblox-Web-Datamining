import React from "react";
import { Redirect, Route, Switch } from "react-router-dom";
import { baseParentalControlsPath } from "../../../constants/parentalControls/parentalControlsConstants";
import {
  getParentZoneTopGameDetailsPath,
  parentZonePages,
} from "../../../constants/parentalControls/parentZonePages";
import { useGetOdpChildContextQuery } from "../../../../apis/parentalControlsApi";
import OdpTopFriendsPage from "../parentZone/OdpTopFriendsPage";
import TopGames from "../parentDashboard/TopGames";
import ManageOnDeviceParentPage from "../parentZone/ManageOnDeviceParentPage";
import OdpTopGameDetails from "../parentZone/OdpTopGameDetails";
import OdpScreentimeLimitPage from "../parentZone/OdpScreentimeLimitPage";

// Parent Zone subpages. A page is only reachable while its flag is on, so a link to a page the
// server has turned off redirects back to the landing page instead.
export const ParentZoneRoutes = (): JSX.Element => {
  const { data: odpChildContext, isLoading, isUninitialized } = useGetOdpChildContextQuery();
  const isChildContextSettled = !isLoading && !isUninitialized;

  return (
    <Switch>
      {odpChildContext?.canParentManageChildsScreentime === true && (
        <Route exact path={parentZonePages.screentimeManagementPage.path}>
          <OdpScreentimeLimitPage />
        </Route>
      )}

      {odpChildContext?.canParentViewChildFriends === true && (
        <Route exact path={parentZonePages.friendManagementPage.path}>
          <OdpTopFriendsPage />
        </Route>
      )}

      {odpChildContext?.canParentManageChildsExperiences === true && (
        <Route exact path={parentZonePages.topGameDetailsPage.path}>
          <OdpTopGameDetails />
        </Route>
      )}

      {odpChildContext?.canParentManageChildsExperiences === true && (
        <Route exact path={parentZonePages.topGamesPage.path}>
          <TopGames isParentFacing detailsPath={getParentZoneTopGameDetailsPath} />
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
