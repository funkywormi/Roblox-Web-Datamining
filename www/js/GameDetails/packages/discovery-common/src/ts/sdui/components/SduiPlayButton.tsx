import React, { useCallback, useMemo } from "react";
import { usePlayabilityStatus, PlayabilityStatus, PlayButton } from "@rbx/game-play-button";
import { EventStreamMetadata, TPlayGameClicked } from "../../common/constants/eventStreamConstants";
import { buildCommonReferralParams } from "../system/actions/openGameDetailsParser";
import { TSduiCommonProps } from "../system/SduiTypes";
import { getEventContext, parseMaybeStringNumberField } from "../utils/analyticsParsingUtils";
import { SduiActionType, TSduiActionConfig } from "../system/SduiActionParserRegistry";
import { parseCallback } from "../system/SduiParsers";

type TSduiPlayButtonProps = {
  universeId: string | number;
  placeId: string | number;

  width?: number;

  // Text to display if the button is playable
  playableText?: string;

  // If true, hide the Play icon if the button is playable
  hidePlayableIcon?: boolean;

  /**
    TODO https://roblox.atlassian.net/browse/CLIGROW-2198:
    Add additional supported props to match App

    openGameDetailsOnPurchaseRequired,
    hideIfUnplayable,
    buttonSize,
    referralSource,
    eventContext
   */
} & TSduiCommonProps;

const SduiPlayButton = ({
  analyticsContext,
  sduiContext,
  universeId,
  placeId,
  width,
  playableText,
  hidePlayableIcon,
}: TSduiPlayButtonProps): JSX.Element => {
  const { playabilityStatus } = usePlayabilityStatus(universeId.toString());

  const reportActionEvent = useCallback(() => {
    const actionConfig: TSduiActionConfig = {
      actionType: SduiActionType.PlayButtonClick,
      actionParams: {},
    };

    const parsedAction = parseCallback(actionConfig, analyticsContext, sduiContext);

    // The actual game launch is handled by the PlayButton component
    // This executeAction call is for the action analytics only
    parsedAction.onActivated();
  }, [analyticsContext, sduiContext]);

  const playButtonEventProperties = useMemo<TPlayGameClicked>(() => {
    const commonReferralParams = buildCommonReferralParams(analyticsContext, sduiContext);

    return {
      ...commonReferralParams,
      [EventStreamMetadata.IsAd]: (
        commonReferralParams[EventStreamMetadata.IsAd] ?? false
      ).toString(),
      [EventStreamMetadata.PlaceId]: parseMaybeStringNumberField(placeId, -1),
      [EventStreamMetadata.UniverseId]: parseMaybeStringNumberField(universeId, -1),
      [EventStreamMetadata.PlayContext]: sduiContext.pageContext.pageName,
    };
  }, [analyticsContext, placeId, universeId, sduiContext]);

  // TODO https://roblox.atlassian.net/browse/CLIGROW-2198
  // Handle unplayable and unplayable loading states
  if (playabilityStatus === undefined || playabilityStatus !== PlayabilityStatus.Playable) {
    return <React.Fragment />;
  }

  return (
    <div
      className="sdui-play-button-container"
      data-testid="sdui-play-button-container"
      style={
        width
          ? {
              width: `${width}px`,
            }
          : {}
      }
    >
      <PlayButton
        universeId={universeId.toString()}
        placeId={placeId.toString()}
        // TODO https://roblox.atlassian.net/browse/CLIGROW-2198
        // Add play button analytics through action tracking
        eventProperties={playButtonEventProperties}
        status={playabilityStatus}
        disableLoadingState
        pageContext={getEventContext(sduiContext.pageContext) ?? "UNKNOWN"}
        buttonText={playableText}
        hideIcon={hidePlayableIcon}
        analyticsCallback={reportActionEvent}
      />
    </div>
  );
};

SduiPlayButton.defaultProps = {
  width: undefined,
  playableText: undefined,
  hidePlayableIcon: undefined,
};

export default SduiPlayButton;
