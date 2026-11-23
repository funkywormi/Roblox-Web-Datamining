import React, { useCallback } from "react";
import { type TAppsFlyerReferralProperties } from "../types/playButtonTypes";
import playButtonConstants, { demoPlayActionType } from "../constants/playButtonConstants";
import { getJoindata, handleShareLinkEventLogging, launchGame } from "../utils/playButtonUtils";
import { usePlayButtonTranslate } from "../hooks/usePlayButtonTranslate";

const { playButtonTextTranslationMap } = playButtonConstants;

export type TDemoButtonProps = {
  universeId: string;
  placeId: string;
  rootPlaceId?: string;
  privateServerLinkCode?: string;
  gameInstanceId?: string;
  eventProperties?: Record<string, string | number | undefined>;
  appsFlyerReferralProperties?: TAppsFlyerReferralProperties;
};

export const DemoButton = ({
  universeId,
  placeId,
  rootPlaceId,
  privateServerLinkCode,
  gameInstanceId,
  eventProperties,
  appsFlyerReferralProperties,
}: TDemoButtonProps): React.JSX.Element => {
  const translate = usePlayButtonTranslate();
  const handlePlayDemo = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      handleShareLinkEventLogging(placeId, universeId);
      const joinData = getJoindata(
        eventProperties?.launchData != null ? String(eventProperties.launchData) : undefined,
      );
      launchGame(
        placeId,
        rootPlaceId,
        privateServerLinkCode,
        gameInstanceId,
        eventProperties,
        joinData,
        appsFlyerReferralProperties,
        demoPlayActionType,
      );
    },
    [
      universeId,
      placeId,
      rootPlaceId,
      privateServerLinkCode,
      gameInstanceId,
      eventProperties,
      appsFlyerReferralProperties,
    ],
  );

  const demoButtonText = translate(playButtonTextTranslationMap.PlayDemo) || "Play Demo";

  return (
    <button
      type="button"
      data-testid="demo-play-button"
      className="btn-control-lg btn-full-width demo-play-button"
      onClick={handlePlayDemo}
    >
      {demoButtonText}
    </button>
  );
};

export default DemoButton;
