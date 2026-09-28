import React from "react";
import OdpScreentimeInsights from "./OdpScreentimeInsights";
import OdpTopFriendsInsights from "./OdpTopFriendsInsights";
import OdpTopGamesInsights from "./OdpTopGamesInsights";
import { useGetOdpChildContextQuery } from "../../../../apis/parentalControlsApi";

export const OdpParentInsights = (): JSX.Element | null => {
  const { data: odpChildContext } = useGetOdpChildContextQuery();

  const showScreentime = odpChildContext?.canParentManageChildsScreentime === true;
  const showTopFriends = odpChildContext?.canParentViewChildFriends === true;
  const showTopGames = odpChildContext?.canParentManageChildsExperiences === true;

  if (!showScreentime && !showTopFriends && !showTopGames) {
    return null;
  }

  return (
    <React.Fragment>
      {showScreentime && (
        <React.Fragment>
          <div className="rbx-divider" />
          <OdpScreentimeInsights />
        </React.Fragment>
      )}

      {showTopFriends && (
        <React.Fragment>
          <div className="rbx-divider" />
          <OdpTopFriendsInsights />
        </React.Fragment>
      )}

      {showTopGames && (
        <React.Fragment>
          <div className="rbx-divider" />
          <OdpTopGamesInsights />
        </React.Fragment>
      )}
    </React.Fragment>
  );
};

export default OdpParentInsights;
