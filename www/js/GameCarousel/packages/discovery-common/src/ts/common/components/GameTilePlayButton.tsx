import React from "react";
import classNames from "classnames";
import {
  usePlayabilityStatus,
  PlayabilityStatus,
  PlayButton as PlayButtonComponent,
  PurchaseButton,
  type TPlayButtonPageContext,
} from "@rbx/game-play-button";
import HoverTilePurchaseButton from "./HoverTilePurchaseButton";
import type { PageContext } from "../types/pageContext";
import { getEventContext } from "../constants/eventStreamConstants";

export const PlayButtonLoadingShimmer = (): JSX.Element => {
  return (
    <div
      className="shimmer play-button game-card-thumb-container"
      data-testid="play-button-default"
    />
  );
};

/**
 * @deprecated - Use GameTilePlayButtonV2 instead
 */
export const GameTilePlayButton = ({
  universeId,
  placeId,
  playButtonEventProperties,
  buttonClassName,
  purchaseIconClassName,
  clientReferralUrl,
  shouldPurchaseNavigateToDetails,
  page,
}: {
  universeId: string;
  placeId: string;
  playButtonEventProperties?: Record<string, string | number | undefined>;
  buttonClassName?: string;
  purchaseIconClassName?: string;
  clientReferralUrl?: string;
  shouldPurchaseNavigateToDetails?: boolean;
  page?: PageContext;
}): JSX.Element => {
  // This is a safe cast because `getEventContext` returns "UNKNOWN" if there's
  // no matching event context
  const pageContext = getEventContext(page) as TPlayButtonPageContext;
  const { playabilityStatus, refetchPlayabilityData } = usePlayabilityStatus(universeId);

  switch (playabilityStatus) {
    case undefined:
    case PlayabilityStatus.GuestProhibited:
    case PlayabilityStatus.Playable:
      return (
        <PlayButtonComponent
          universeId={universeId}
          placeId={placeId}
          status={playabilityStatus ?? PlayabilityStatus.Playable}
          eventProperties={playButtonEventProperties}
          buttonClassName={
            buttonClassName ? classNames(buttonClassName, "regular-play-button") : undefined
          }
          disableLoadingState
          pageContext={pageContext}
        />
      );
    case PlayabilityStatus.PurchaseRequired:
      if (shouldPurchaseNavigateToDetails) {
        // Navigates to Game Details page for user to purchase
        return (
          <HoverTilePurchaseButton
            placeId={placeId}
            clientReferralUrl={clientReferralUrl}
            purchaseIconClassName={purchaseIconClassName ?? "icon-common-play"}
            buttonClassName={classNames(
              buttonClassName ?? "btn-growth-lg play-button",
              "purchase-button",
            )}
          />
        );
      }
      return (
        <PurchaseButton
          universeId={universeId}
          placeId={placeId}
          iconClassName={purchaseIconClassName ?? "icon-common-play"}
          refetchPlayabilityStatus={refetchPlayabilityData}
          buttonClassName={buttonClassName}
          playabilityStatus={PlayabilityStatus.PurchaseRequired}
          pageContext={pageContext}
        />
      );
    case PlayabilityStatus.UniverseRootPlaceIsPrivate:
      return (
        <div className={buttonClassName ?? "btn-growth-lg play-button"}>
          <span className="icon-status-private" />
        </div>
      );
    default:
      return (
        <div className={buttonClassName ?? "btn-growth-lg play-button"}>
          <span className="icon-status-unavailable" />
        </div>
      );
  }
};

GameTilePlayButton.defaultProps = {
  playButtonEventProperties: {},
  buttonClassName: undefined,
  purchaseIconClassName: undefined,
  clientReferralUrl: undefined,
  shouldPurchaseNavigateToDetails: false,
};

export default GameTilePlayButton;
