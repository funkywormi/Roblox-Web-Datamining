import { useEffect, useRef } from "react";
import type { JoinDataProperties } from "@rbx/core-scripts/game";
import { launchGame } from "@rbx/game-play-button";
import { EventStreamMetadata } from "../../common/constants/eventStreamConstants";
import { PageContext } from "../../common/types/pageContext";

type TDesktopWasmRedirectProps = {
  placeId: string;
  rootPlaceId: string;
  universeId: string;
  privateServerLinkCode: string;
  gameInstanceId: string;
  joinData: JoinDataProperties;
  playOnWeb: (() => void) | undefined;
};

/**
 * Launches the app like the EDP's Play button. If the client doesn't start, the install dialog
 * offers Play on Web when it's available, and the download otherwise.
 */
const DesktopWasmRedirect = ({
  placeId,
  rootPlaceId,
  universeId,
  privateServerLinkCode,
  gameInstanceId,
  joinData,
  playOnWeb,
}: TDesktopWasmRedirectProps): null => {
  const playOnWebRef = useRef(playOnWeb);
  useEffect(() => {
    playOnWebRef.current = playOnWeb;
  }, [playOnWeb]);

  const hasLaunched = useRef(false);
  useEffect(() => {
    if (hasLaunched.current || !placeId) {
      return;
    }
    hasLaunched.current = true;
    launchGame(
      placeId,
      rootPlaceId,
      privateServerLinkCode,
      gameInstanceId,
      {
        [EventStreamMetadata.PlaceId]: placeId,
        [EventStreamMetadata.UniverseId]: universeId,
        [EventStreamMetadata.PlayContext]: PageContext.GameDetailPage,
      },
      {
        ...joinData,
        getPlayOnWeb: () => playOnWebRef.current,
      },
    );
  }, [placeId, rootPlaceId, universeId, privateServerLinkCode, gameInstanceId, joinData]);

  return null;
};

export default DesktopWasmRedirect;
