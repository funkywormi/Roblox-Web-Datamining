import { DefaultPlayButton, usePlayabilityStatus } from "@rbx/game-play-button";
import type { TGameCardPlayButtonProps } from "./GameCardPlayButtonContext";

const GameCardPlayButton = ({
  placeId,
  rootPlaceId,
  universeId,
  privateServerLinkCode,
  gameInstanceId,
  launchData,
}: TGameCardPlayButtonProps) => {
  const { playabilityStatus, refetchPlayabilityData } = usePlayabilityStatus(universeId);
  return (
    <DefaultPlayButton
      placeId={placeId}
      rootPlaceId={rootPlaceId}
      universeId={universeId}
      privateServerLinkCode={privateServerLinkCode}
      gameInstanceId={gameInstanceId}
      eventProperties={launchData != null ? { launchData } : undefined}
      playabilityStatus={playabilityStatus}
      refetchPlayabilityStatus={refetchPlayabilityData}
      pageContext="UNKNOWN"
    />
  );
};

export default GameCardPlayButton;
