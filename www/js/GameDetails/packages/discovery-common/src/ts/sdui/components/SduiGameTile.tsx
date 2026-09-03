import React, { useMemo } from "react";
import { TSduiCommonProps } from "../system/SduiTypes";
import SduiTile, { TSduiTileProps } from "./SduiTile";
import { SduiActionType, TSduiParsedAction } from "../system/SduiActionParserRegistry";
import { parseCallback } from "../system/SduiParsers";
import SduiGameTileFooter from "./SduiGameTileFooter";

type TSduiGameTileProps = TSduiTileProps & {
  universeId: string;
  placeId: string;

  ratingText?: string;
  playerCount?: number;

  disableDefaultFooterLogic?: boolean;
} & TSduiCommonProps;

const SduiGameTile = ({
  sduiContext,
  analyticsContext,

  universeId,
  placeId,

  ratingText,
  playerCount,

  disableDefaultFooterLogic,

  onActivated,
  footerComponent,
  ...props
}: TSduiGameTileProps): JSX.Element => {
  const derivedOnActivated: TSduiParsedAction = useMemo(() => {
    if (onActivated) {
      return onActivated;
    }

    const actionConfig = {
      actionType: SduiActionType.OpenGameDetails,
      actionParams: {
        placeId,
        universeId,
      },
    };

    return parseCallback(actionConfig, analyticsContext, sduiContext);
  }, [onActivated, placeId, universeId, analyticsContext, sduiContext]);

  const derivedFooterComponent = useMemo(() => {
    if (disableDefaultFooterLogic) {
      return footerComponent;
    }

    return (
      <SduiGameTileFooter
        universeId={universeId}
        footerComponent={footerComponent}
        ratingText={ratingText}
        playerCount={playerCount}
        sduiContext={sduiContext}
        analyticsContext={analyticsContext}
      />
    );
  }, [
    disableDefaultFooterLogic,
    footerComponent,
    universeId,
    ratingText,
    playerCount,
    sduiContext,
    analyticsContext,
  ]);

  return (
    <SduiTile
      {...props}
      sduiContext={sduiContext}
      analyticsContext={analyticsContext}
      onActivated={derivedOnActivated}
      footerComponent={derivedFooterComponent}
    />
  );
};

export default SduiGameTile;
