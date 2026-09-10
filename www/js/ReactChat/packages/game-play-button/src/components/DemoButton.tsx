import React, { useCallback } from "react";
import { TranslateFunction, withTranslations } from "@rbx/core-scripts/react";
import { translations } from "../constants/translations";
import { type TAppsFlyerReferralProperties } from "../types/playButtonTypes";
import playButtonConstants from "../constants/playButtonConstants";
import { handleShareLinkEventLogging, launchGame } from "../utils/playButtonUtils";

const { playButtonTextTranslationMap } = playButtonConstants;

// Mirror the join data PlayButton's doGameLaunch resolves, so demo launches honor
// the same launchData/eventId deep-link params.
const getJoinData = (launchDataFromProps?: string) => {
  const params = new URLSearchParams(window.location.search);
  return {
    launchData: params.get("launchData") ?? launchDataFromProps,
    eventId: params.get("eventId") ?? undefined,
  };
};

export type TDemoButtonProps = {
  universeId: string;
  placeId: string;
  rootPlaceId?: string;
  privateServerLinkCode?: string;
  gameInstanceId?: string;
  eventProperties?: Record<string, string | number | undefined>;
  appsFlyerReferralProperties?: TAppsFlyerReferralProperties;
};

const DemoButtonContent = ({
  translate,
  universeId,
  placeId,
  rootPlaceId,
  privateServerLinkCode,
  gameInstanceId,
  eventProperties,
  appsFlyerReferralProperties,
}: TDemoButtonProps & { translate: TranslateFunction }): React.JSX.Element => {
  const handlePlayDemo = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      handleShareLinkEventLogging(placeId, universeId);
      const joinData = getJoinData(
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
        "DemoPlayButtonClick",
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

export const DemoButton = withTranslations<TDemoButtonProps>(DemoButtonContent, translations);

export default DemoButton;
