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
      // Foundation glyphs: Next.js doesn't load the legacy sprites (icon-common-play,
      // icon-robux-white, icon-status-unavailable-secondary). Applies to .NET chat too.
      iconClassName="icon icon-filled-play-large size-700"
      purchaseIconClassName="icon icon-regular-robux size-400"
      unplayableIconClassName="icon icon-filled-circle-slash size-400"
      pageContext="UNKNOWN"
    />
  );
};

export default GameCardPlayButton;
