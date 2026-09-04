"use client";

import { type SyntheticEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { md5 } from "js-md5";
import { authenticatedUser } from "@rbx/core-scripts/meta/user";
import { useTheme } from "@rbx/core-scripts/react";
import {
  getCurrentEnvironment,
  isVideoPlayerSupportedByBrowser,
  RobloxVideoPlayer,
  type VideoAnalyticsConfig,
  type VideoPlayerRef,
} from "@rbx/video-player";
import { CacheProvider, createCache, UIThemeProvider } from "@rbx/ui";
import { type SduiRendererInjectedProps, type SduiScaleType } from "@rbx/sdui-core";
import { SduiErrorBoundary, useSduiServices } from "@rbx/sdui-core/client";
import { getVideoPlayerStyles } from "./videoPlayerStyleUtils";
import { VideoPlayerLoadingFallback } from "./VideoPlayerLoadingFallback";
import { VIDEO_PLAYBACK_BEHAVIOR } from "./sduiVideoPlayerConstants";
import { SduiVideoError } from "../../telemetry/sduiVideoErrorConstants";
import {
  getVideoCmcdInstanceTypeFromSdui,
  getVideoEventPageContextFromSdui,
  reportSduiVideoError,
} from "../../utils/sduiVideoAnalyticsUtils";

const videoPlayerCache = createCache();

export interface SduiVideoPlayerProps extends SduiRendererInjectedProps {
  videoAssetId?: string;
  loop?: boolean;
  muted?: boolean;
  /** Arrives unvalidated from the template, so values outside {@link VIDEO_PLAYBACK_BEHAVIOR} are possible. */
  playbackBehavior?: string;
  /** ImageStringProp value (`rbxassetid://...` or `rbxthumb://...`). */
  loadingImage?: string;
  disableControls?: boolean;
  scaleType?: SduiScaleType;
}

type SduiVideoPlayerInnerProps = SduiVideoPlayerProps & { videoAssetId: string };

function formatErrorDetails(name: string, message: string): string {
  return `Name: ${name}; Message: ${message}`;
}

function SduiVideoPlayerInner({
  videoAssetId,
  loop = false,
  muted = true,
  playbackBehavior = VIDEO_PLAYBACK_BEHAVIOR.PlayWhenReady,
  loadingImage,
  disableControls = true,
  scaleType,
}: SduiVideoPlayerInnerProps) {
  const theme = useTheme();
  const { errorReporter, pageContext } = useSduiServices();
  const videoRef = useRef<VideoPlayerRef | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [hasFailed, setHasFailed] = useState(false);

  const environment = useMemo(() => getCurrentEnvironment(), []);
  const browserCompatibility = useMemo(() => isVideoPlayerSupportedByBrowser(), []);
  const isBrowserSupported = browserCompatibility.isSupported;
  const showFailedFallback = hasFailed || !isBrowserSupported;

  const cmcdUserKey = useMemo(() => {
    const userId = authenticatedUser()?.id;
    if (!userId) {
      return undefined;
    }

    return md5(userId.toString());
  }, []);

  // Resolve page→video telemetry mappings once per pageContext change. The mappers
  // report unmapped pages; calling them during render would re-fire on every paint.
  const { eventPageContext, cmcdInstanceType } = useMemo(
    () => ({
      eventPageContext: getVideoEventPageContextFromSdui(pageContext, errorReporter),
      cmcdInstanceType: getVideoCmcdInstanceTypeFromSdui(pageContext, errorReporter),
    }),
    [errorReporter, pageContext],
  );

  const analyticsConfig: VideoAnalyticsConfig = useMemo(() => {
    return {
      target: "www",
      assetId: videoAssetId,
      environment,
      source: "asset",
      sourceId: videoAssetId,
      completionThreshold: 100,
      pageContext: eventPageContext,
    };
  }, [environment, eventPageContext, videoAssetId]);

  const handleFailure = useCallback(() => {
    setHasFailed(true);
  }, []);

  useEffect(() => {
    if (isBrowserSupported) {
      return;
    }

    const supportErrors = browserCompatibility.errors.join("; ");
    const message =
      supportErrors.length > 0
        ? `Browser does not support video player: ${supportErrors}`
        : "Browser does not support video player";
    reportSduiVideoError(
      errorReporter,
      SduiVideoError.BrowserUnsupported,
      formatErrorDetails("BrowserUnsupported", message),
      pageContext,
    );
  }, [browserCompatibility.errors, errorReporter, isBrowserSupported, pageContext]);

  const playVideo = useCallback(async () => {
    if (!isBrowserSupported) {
      return;
    }

    const video = videoRef.current;
    if (!video) {
      reportSduiVideoError(
        errorReporter,
        SduiVideoError.PlayerMissingOnPlayError,
        formatErrorDetails(
          "PlayerMissingOnPlayError",
          "RobloxVideoPlayer ref was missing when play() was invoked",
        ),
        pageContext,
      );
      return;
    }

    try {
      await video.play();
    } catch (error) {
      const name = error instanceof Error ? error.name : "UnknownError";
      const message = error instanceof Error && error.message ? error.message : String(error);
      reportSduiVideoError(
        errorReporter,
        SduiVideoError.PlayerPlayError,
        formatErrorDetails(name, `RobloxVideoPlayer play() rejected: ${message}`),
        pageContext,
      );
    }
  }, [errorReporter, isBrowserSupported, pageContext]);

  const shouldPlayWhenReady = playbackBehavior === VIDEO_PLAYBACK_BEHAVIOR.PlayWhenReady;

  const handleVideoLoadEnd = useCallback(() => {
    setIsReady(true);

    if (shouldPlayWhenReady) {
      playVideo().catch(() => undefined);
    }
  }, [playVideo, shouldPlayWhenReady]);

  const handleMediaError = useCallback(
    (event: SyntheticEvent<HTMLVideoElement>) => {
      const mediaError = event.currentTarget.error;
      const message = mediaError?.message
        ? `${mediaError.message} (code ${mediaError.code})`
        : `HTMLMediaElement emitted an error event (code ${mediaError?.code ?? "unknown"})`;

      reportSduiVideoError(
        errorReporter,
        SduiVideoError.PlayerMediaError,
        formatErrorDetails("MediaError", message),
        pageContext,
      );
      handleFailure();
    },
    [errorReporter, handleFailure, pageContext],
  );

  const handleLoadError = useCallback(
    (error: Error) => {
      reportSduiVideoError(
        errorReporter,
        SduiVideoError.PlayerLoadError,
        formatErrorDetails(error.name || "Error", error.message || "Unknown video load error"),
        pageContext,
      );
      handleFailure();
    },
    [errorReporter, handleFailure, pageContext],
  );

  const handleErrorBoundaryError = useCallback(
    (error: Error) => {
      reportSduiVideoError(
        errorReporter,
        SduiVideoError.PlayerErrorBoundaryError,
        formatErrorDetails(error.name || "Error", error.message || "Unknown render error"),
        pageContext,
      );
      handleFailure();
    },
    [errorReporter, handleFailure, pageContext],
  );

  const { rootStyles, videoPlayerStyles, loadingStyles } = getVideoPlayerStyles({
    scaleType,
    isReady: isReady && !showFailedFallback,
  });

  return (
    <CacheProvider cache={videoPlayerCache}>
      <UIThemeProvider
        theme={theme === "dark" ? "foundation-dark" : "foundation-light"}
        cssBaselineMode="disabled"
      >
        <div {...rootStyles} data-testid="sdui-video-player">
          {/* Poster/skeleton stays mounted under the video so the fade-in can blend over it. */}
          <VideoPlayerLoadingFallback
            loadingImage={loadingImage}
            scaleType={scaleType}
            loadingStyles={loadingStyles}
            hasFailed={showFailedFallback}
          />

          {isBrowserSupported && !hasFailed && (
            <SduiErrorBoundary onError={handleErrorBoundaryError}>
              <RobloxVideoPlayer
                ref={videoRef}
                {...videoPlayerStyles}
                environment={environment}
                videoAssetId={videoAssetId}
                loop={loop}
                muted={muted}
                disableControls={disableControls}
                enableAnalytics
                analyticsConfig={analyticsConfig}
                onLoadVideoEnd={handleVideoLoadEnd}
                onError={handleMediaError}
                onLoadError={handleLoadError}
                cmcdInstanceType={cmcdInstanceType}
                cmcdUserKey={cmcdUserKey}
              />
            </SduiErrorBoundary>
          )}
        </div>
      </UIThemeProvider>
    </CacheProvider>
  );
}

export function SduiVideoPlayer(props: SduiVideoPlayerProps) {
  if (!props.videoAssetId) {
    return null;
  }
  // Remount when `videoAssetId` changes so ready/failed state resets without an Effect.
  return (
    <SduiVideoPlayerInner {...props} videoAssetId={props.videoAssetId} key={props.videoAssetId} />
  );
}
