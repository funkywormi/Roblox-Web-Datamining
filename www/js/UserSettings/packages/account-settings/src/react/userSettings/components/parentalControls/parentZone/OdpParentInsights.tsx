import React from "react";
import OdpScreentimeInsights from "./OdpScreentimeInsights";
import OdpTopGamesInsights from "./OdpTopGamesInsights";
import { useGetOdpChildContextQuery } from "../../../../apis/parentalControlsApi";

// Parent insights in Parent Zone. Top friends follows in its own PR.
export const OdpParentInsights = (): JSX.Element | null => {
  const { data: odpChildContext } = useGetOdpChildContextQuery();

  const showScreentime = odpChildContext?.canParentManageChildsScreentime === true;
  const showTopGames = odpChildContext?.canParentManageChildsExperiences === true;

  if (!showScreentime && !showTopGames) {
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
