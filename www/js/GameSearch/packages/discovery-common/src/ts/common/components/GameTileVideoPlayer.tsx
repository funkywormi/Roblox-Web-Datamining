import React, { useState, useCallback } from "react";
import GamePreviewVideoPlayer from "../../gameDetails/components/GamePreviewVideoPlayer";
import useIsEligibleForVideoPreview from "../../gameDetails/hooks/useIsEligibleForVideoPreview";
import { CacheProvider, createCache, UIThemeProvider } from "@rbx/ui";
import { useTheme } from "@rbx/core-scripts/react";
import { PageContext } from "../types/pageContext";

const cache = createCache();

type TGameTileVideoPlayerProps = {
  videoAssetId: number;
  universeId: string;
  page?: PageContext;
};

/**
 * Renders a video player on a game tile during hover.
 *
 * Checks eligibility (playability) with a loading shimmer, and then
 * renders GamePreviewVideoPlayer once eligible.
 * The video fades in via CSS (.is-ready) when ready.
 *
 * If eligibility fails or the video errors, renders nothing (thumbnail shows through).
 */
const GameTileVideoPlayer = ({
  videoAssetId,
  universeId,
  page,
}: TGameTileVideoPlayerProps): JSX.Element | null => {
  const theme = useTheme();

  const [hasVideoFailed, setHasVideoFailed] = useState(false);

  const { isEligibleForVideoPreview: isEligible, isLoadingEligibility } =
    useIsEligibleForVideoPreview(
      universeId,
      true, // shouldBypassIxpCheck
    );

  const handleFailure = useCallback(() => {
    setHasVideoFailed(true);
  }, []);

  const shimmerComponent = (
    <div
      className="wide-game-tile-video-shimmer-overlay shimmer"
      data-testid="wide-game-tile-video-shimmer"
    />
  );

  // Render nothing if eligibility failed or video errored
  if (hasVideoFailed || (!isLoadingEligibility && !isEligible)) {
    return null;
  }

  // Show shimmer during eligibility check (before GamePreviewVideoPlayer mounts)
  if (isLoadingEligibility) {
    return shimmerComponent;
  }

  return (
    <CacheProvider cache={cache}>
      <UIThemeProvider theme={theme} cssBaselineMode="disabled">
        <GamePreviewVideoPlayer
          isActive
          className="wide-game-tile-video-player"
          videoAssetId={videoAssetId}
          universeId={universeId}
          loadingComponent={shimmerComponent}
          handleFailure={handleFailure}
          disableControls
          page={page}
        />
      </UIThemeProvider>
    </CacheProvider>
  );
};

export default GameTileVideoPlayer;
