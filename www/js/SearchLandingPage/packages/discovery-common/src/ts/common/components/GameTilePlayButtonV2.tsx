import React, { useMemo } from "react";
import { ValidHttpUrl } from "@rbx/core-scripts/util/url";
import { Loading } from "@rbx/core-ui";
import {
  usePlayabilityStatus,
  PlayabilityStatus,
  DefaultPlayButton,
  type TPlayButtonPageContext,
} from "@rbx/game-play-button";
import { ValueOf } from "../utils/typeUtils";
import useGetAppPolicyData from "../hooks/useGetAppPolicyData";
import type { PageContext } from "../types/pageContext";
import { getEventContext } from "../constants/eventStreamConstants";

export const GameTilePlayButtonV2 = ({
  universeId,
  placeId,
  playButtonEventProperties,
  disableLoadingState,
  redirectPurchaseUrl,
  page,
}: {
  universeId: string;
  placeId: string;
  playButtonEventProperties?: Record<string, string | number | undefined>;
  disableLoadingState?: boolean;
  redirectPurchaseUrl?: ValidHttpUrl;
  page?: PageContext;
}): JSX.Element => {
  const { playabilityStatus, demoModeAvailable, refetchPlayabilityData } =
    usePlayabilityStatus(universeId);

  const { shouldShowVpcPlayButtonUpsells, isFetchingPolicy } = useGetAppPolicyData();

  // This is a safe cast because `getEventContext` returns "UNKNOWN" if there's
  // no matching event context
  const pageContext = getEventContext(page) as TPlayButtonPageContext;

  const isPurchaseRequired = useMemo((): boolean => {
    if (!playabilityStatus) {
      return false;
    }
    const allowedList = [
      PlayabilityStatus.PurchaseRequired,
      PlayabilityStatus.FiatPurchaseRequired,
    ] as ValueOf<typeof PlayabilityStatus>[];

    return allowedList.includes(playabilityStatus);
  }, [playabilityStatus]);

  if (isFetchingPolicy) {
    if (!disableLoadingState) {
      return <Loading />;
    }

    return (
      <DefaultPlayButton
        placeId={placeId}
        universeId={universeId}
        refetchPlayabilityStatus={refetchPlayabilityData}
        playabilityStatus={PlayabilityStatus.Playable}
        eventProperties={playButtonEventProperties}
        hideButtonText
        disableLoadingState={disableLoadingState}
        pageContext={pageContext}
      />
    );
  }

  return (
    <DefaultPlayButton
      placeId={placeId}
      universeId={universeId}
      refetchPlayabilityStatus={refetchPlayabilityData}
      playabilityStatus={playabilityStatus}
      eventProperties={playButtonEventProperties}
      disableLoadingState={disableLoadingState}
      buttonClassName={
        isPurchaseRequired ? "btn-economy-robux-white-lg purchase-button" : undefined
      }
      hideButtonText={!isPurchaseRequired}
      redirectPurchaseUrl={isPurchaseRequired ? redirectPurchaseUrl : undefined}
      showDefaultPurchaseText={playabilityStatus === PlayabilityStatus.FiatPurchaseRequired}
      shouldShowVpcPlayButtonUpsells={shouldShowVpcPlayButtonUpsells}
      demoModeAvailable={demoModeAvailable}
      pageContext={pageContext}
    />
  );
};

GameTilePlayButtonV2.defaultProps = {
  playButtonEventProperties: {},
  disableLoadingState: false,
  redirectPurchaseUrl: undefined,
};

export default GameTilePlayButtonV2;
