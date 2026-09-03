import React from "react";
import { TranslateFunction } from "@rbx/core-scripts/react";
import { Loading } from "@rbx/core-ui";
import EventsListContainer from "./components/EventsListContainer";
import { TGetGameDetails } from "../common/types/bedev1Types";
import useEventDetailsForUniverseId from "./hooks/useEventDetailsForUniverseId";
import { TDiscoverySessionInfo } from "../common/constants/eventStreamConstants";
import { PageContext } from "../common/types/pageContext";

type TGameDetailsVirtualEventsSectionProps = {
  universeId: string;
  gameDetails: TGetGameDetails | undefined;
  attributionId: string;
  referralSessionInfo: TDiscoverySessionInfo;
  referralPage: PageContext | undefined;
  translate: TranslateFunction;
};

const GameDetailsVirtualEventsSection = ({
  universeId,
  gameDetails,
  attributionId,
  referralSessionInfo,
  referralPage,
  translate,
}: TGameDetailsVirtualEventsSectionProps): JSX.Element => {
  const { eventDetails, hasError } = useEventDetailsForUniverseId(universeId);

  if (hasError) {
    // show nothing, as the user can use the rest of the page as normal
    return <React.Fragment />;
  }

  if (eventDetails === undefined || gameDetails === undefined) {
    return <Loading />;
  }

  if (eventDetails?.length > 0 && gameDetails !== undefined) {
    return (
      <div className="virtual-event-game-details-container">
        <EventsListContainer
          eventList={eventDetails}
          universeDetails={gameDetails}
          attributionId={attributionId}
          referralSessionInfo={referralSessionInfo}
          referralPage={referralPage}
          translate={translate}
        />
      </div>
    );
  }

  return <React.Fragment />;
};

export default GameDetailsVirtualEventsSection;
