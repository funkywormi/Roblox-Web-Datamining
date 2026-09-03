import React, { useMemo } from "react";
import SduiGameTileActiveFriendsFooter from "./SduiGameTileActiveFriendsFooter";
import { SduiRegisteredComponents } from "../system/SduiComponentRegistry";
import { TAnalyticsContext, TSduiContext } from "../system/SduiTypes";
import SduiTileFooter from "./SduiTileFooter";
import parsingUtils from "../../common/utils/parsingUtils";

type TSduiGameTileFooterProps = {
  sduiContext: TSduiContext;
  analyticsContext: TAnalyticsContext;

  universeId: string;

  ratingText?: string;
  playerCount?: number;

  footerComponent?: JSX.Element;
};

const SduiGameTileFooter = ({
  sduiContext,
  analyticsContext,

  universeId,

  ratingText,
  playerCount,

  footerComponent,
}: TSduiGameTileFooterProps): JSX.Element | null => {
  const { tokens } = sduiContext.dependencies;

  const hasFriendInGame: boolean = useMemo(() => {
    if (
      sduiContext.dataStore.social.inGameFriendsByUniverseId[universeId] &&
      sduiContext.dataStore.social.inGameFriendsByUniverseId[universeId].length > 0
    ) {
      return true;
    }

    return false;
  }, [sduiContext.dataStore.social.inGameFriendsByUniverseId, universeId]);

  const playerCountText = useMemo(() => {
    if (playerCount !== undefined && playerCount !== null) {
      return parsingUtils.getPlayerCount(playerCount);
    }

    return undefined;
  }, [playerCount]);

  if (hasFriendInGame) {
    return (
      <SduiGameTileActiveFriendsFooter
        componentConfig={{
          componentType: SduiRegisteredComponents.GameTileActiveFriendsFooter,
          props: {},
        }}
        sduiContext={sduiContext}
        analyticsContext={analyticsContext}
        universeId={universeId}
      />
    );
  }

  if (ratingText) {
    return (
      <SduiTileFooter
        componentConfig={{
          componentType: SduiRegisteredComponents.TileFooter,
          props: {},
        }}
        leftText={ratingText}
        leftIcon="sdui-icon icon-rating-16x16"
        rightText={playerCountText}
        rightIcon={playerCountText ? "sdui-icon icon-current-players-16x16" : undefined}
        sduiContext={sduiContext}
        analyticsContext={analyticsContext}
      />
    );
  }

  return footerComponent ?? null;
};

export default SduiGameTileFooter;
