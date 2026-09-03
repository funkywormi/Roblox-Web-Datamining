import React, { useRef, useState, useCallback, useMemo } from "react";
import classNames from "classnames";
import { authenticatedUser } from "@rbx/core-scripts/meta/user";
import { RobloxVideoPlayer, VideoPlayerRef, VideoAnalyticsConfig } from "@rbx/video-player";
import { md5 } from "js-md5";
import useAutoPlayVideoCarouselItem from "../hooks/useAutoPlayVideoCarouselItem";
import ErrorBoundary from "../../common/components/ErrorBoundary";
import getCurrentEnvironment from "../utils/environmentUtils";
import gamePreviewVideoConstants from "../constants/gamePreviewVideoConstants";
import {
  getVideoCmcdInstanceType,
  getVideoEventPageContext,
} from "../../common/utils/videoAnalyticsUtils";
import { PageContext } from "../../common/types/pageContext";

const { gamePreviewVideoCounters } = gamePreviewVideoConstants;

enum VideoPlayingStatus {
  Unstarted = "unstarted",
  Playing = "playing",
  Paused = "paused",
  Ended = "ended",
}

type TGamePreviewVideoPlayerProps = {
  isActive: boolean;
  className: string;
  videoAssetId: number;
  universeId: string;
  loadingComponent: React.ReactNode;
  handleFailure: () => void;
  onPlay?: () => void;
  onPaused?: () => void;
  onEnd?: () => void;
  disableControls?: boolean;
  page?: PageContext;
};

/**
 * Renders a Game Preview Video player using the RobloxVideoPlayer component from @rbx/video-player.
 *
 * Handles auto play logic for the video item when active, and calls parent callbacks for play, pause, and end.
 */
const GamePreviewVideoPlayer = ({
  isActive,
  className,
  videoAssetId,
  universeId,
  loadingComponent,
  handleFailure,
  onPlay,
  onPaused,
  onEnd,
  disableControls = false,
  page,
}: TGamePreviewVideoPlayerProps): JSX.Element => {
  const videoRef = useRef<VideoPlayerRef | null>(null);

  const [isReady, setIsReady] = useState<boolean>(false);
  const [playingStatus, setPlayingStatus] = useState<VideoPlayingStatus>(
    VideoPlayingStatus.Unstarted,
  );

  const environment = useMemo(() => {
    return getCurrentEnvironment();
  }, []);

  const cmcdUserKey = useMemo(() => {
    const userId = authenticatedUser()?.id;
    if (!userId) {
      return undefined;
    }

    return md5(userId.toString());
  }, []);

  const playVideo = useCallback(async () => {
    const video = videoRef.current;
    if (!video) {
      window.EventTracker?.fireEvent(gamePreviewVideoCounters.GamePreviewVideoMissingOnPlayError);
      return;
    }

    try {
      await video.play();
    } catch {
      window.EventTracker?.fireEvent(gamePreviewVideoCounters.GamePreviewVideoPlayError);
    }
  }, []);

  const pauseVideo = useCallback(() => {
    const video = videoRef.current;
    if (!video) {
      window.EventTracker?.fireEvent(gamePreviewVideoCounters.GamePreviewVideoMissingOnPauseError);
      return;
    }

    video.pause();
  }, []);

  useAutoPlayVideoCarouselItem(
    isActive,
    isReady,
    playingStatus === VideoPlayingStatus.Unstarted,
    playingStatus === VideoPlayingStatus.Playing,
    playingStatus === VideoPlayingStatus.Ended,
    playVideo,
    pauseVideo,
  );

  const handleVideoLoadEnd = useCallback(() => {
    setIsReady(true);
  }, []);

  const handlePlay = useCallback(() => {
    setPlayingStatus(VideoPlayingStatus.Playing);
    if (onPlay) {
      onPlay();
    }
  }, [onPlay]);

  const handlePaused = useCallback(() => {
    setPlayingStatus(VideoPlayingStatus.Paused);
    if (onPaused) {
      onPaused();
    }
  }, [onPaused]);

  const handleEnd = useCallback(() => {
    setPlayingStatus(VideoPlayingStatus.Ended);
    if (onEnd) {
      onEnd();
    }
  }, [onEnd]);

  const handleErrorBoundaryError = useCallback(() => {
    window.EventTracker?.fireEvent(gamePreviewVideoCounters.GamePreviewVideoErrorBoundaryError);

    handleFailure();
  }, [handleFailure]);

  const handleError = useCallback(() => {
    window.EventTracker?.fireEvent(gamePreviewVideoCounters.GamePreviewVideoErrorCallback);

    handleFailure();
  }, [handleFailure]);

  const analyticsConfig: VideoAnalyticsConfig = useMemo(() => {
    return {
      target: "www",
      assetId: videoAssetId.toString(),
      environment: environment,
      source: "universe",
      sourceId: universeId,
      completionThreshold: 100,
      pageContext: getVideoEventPageContext(page),
    };
  }, [videoAssetId, universeId, environment, page]);

  return (
    <div className={className}>
      <ErrorBoundary fallback={<React.Fragment />} logError={handleErrorBoundaryError}>
        <div
          className={classNames("video-preview-wrapper", { "is-ready": isReady })}
          data-testid="video-preview-wrapper"
        >
          <RobloxVideoPlayer
            ref={videoRef}
            environment={environment}
            // Video defaults to muted, can be manually unmuted by the user
            muted
            videoAssetId={videoAssetId.toString()}
            onLoadVideoEnd={handleVideoLoadEnd}
            onPlay={handlePlay}
            onPause={handlePaused}
            onEnded={handleEnd}
            onError={handleError}
            enableAnalytics
            analyticsConfig={analyticsConfig}
            disableControls={disableControls}
            cmcdInstanceType={getVideoCmcdInstanceType(page)}
            cmcdUserKey={cmcdUserKey}
          />
        </div>

        {/* Display caller-provided loading component while the video is loading */}
        {!isReady && loadingComponent}
      </ErrorBoundary>
    </div>
  );
};

export default GamePreviewVideoPlayer;
