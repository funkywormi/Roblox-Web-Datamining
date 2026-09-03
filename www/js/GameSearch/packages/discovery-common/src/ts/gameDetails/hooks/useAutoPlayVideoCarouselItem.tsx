import { useEffect, useRef } from "react";
import gamePreviewVideoConstants from "../constants/gamePreviewVideoConstants";

const { gamePreviewVideoCounters } = gamePreviewVideoConstants;

/**
 * Auto plays the video item in the Media Carousel when the item is ready, active, and has not yet started or has ended.
 *
 * Also pauses the video item in the Media Carousel when the item is not active and the video is playing.
 */
const useAutoPlayVideoCarouselItem = (
  isActive: boolean,
  isReady: boolean,
  isNotStarted: boolean,
  isPlaying: boolean,
  isEnded: boolean,
  // Support both async or sync playVideo function
  playVideo: () => void | Promise<void>,
  pauseVideo: () => void,
): void => {
  const isAutoPaused = useRef<boolean>(false);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    if (isActive && (isNotStarted || isEnded || isAutoPaused.current)) {
      // Handle async play function for GamePreviewVideo case
      const result = playVideo();
      if (result instanceof Promise) {
        result.catch(() => {
          window.EventTracker?.fireEvent(gamePreviewVideoCounters.GamePreviewVideoAutoPlayError);
        });
      }
      isAutoPaused.current = false;
    } else if (!isActive && isPlaying) {
      pauseVideo();
      isAutoPaused.current = true;
    }
  }, [isReady, isActive, isNotStarted, isEnded, isPlaying, playVideo, pauseVideo]);
};

export default useAutoPlayVideoCarouselItem;
