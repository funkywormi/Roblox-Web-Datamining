import React from "react";
import TopAppBanner from "@rbx/app-download/TopAppBanner";
import { PlayOnWebVariant } from "@rbx/game-play-button";
import metadataConstants from "../constants/metadataConstants";
import { usePlayOnWebVariant } from "../hooks/usePlayOnWebVariant";
import isUnauthenticatedSupportedCrawler from "../utils/isUnauthenticatedSupportedCrawler";

/**
 * The app download banner above the top nav, for the Play on Web treatment. It reads the same
 * variant as the play button; with the page's shared query client that's one IXP and one
 * playability request.
 */
export default function TopAppBannerContainer(): React.JSX.Element {
  const { universeId = "" } = metadataConstants.metadataData() || {};
  const { playOnWebVariant, isPending } = usePlayOnWebVariant(
    universeId,
    !isUnauthenticatedSupportedCrawler(),
  );

  return (
    <TopAppBanner
      universeId={universeId}
      isTreatment={playOnWebVariant !== PlayOnWebVariant.None}
      isPending={isPending}
    />
  );
}
