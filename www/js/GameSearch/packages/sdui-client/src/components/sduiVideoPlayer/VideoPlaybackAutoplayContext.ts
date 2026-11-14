import { createContext } from "react";

export interface VideoPlaybackAutoplayCallbacks {
  /**
   * The video finished, or this video can never play (failed, unsupported, or not set to
   * autoplay). Releases this tile's autoplay slot so other tiles can play.
   */
  onPlaybackEnded: () => void;
  /** Autoplay is blocked for the whole page (for example Low Power Mode). Stops all viewport autoplay. */
  onPlaybackBlocked: () => void;
}

/**
 * Lets a parent that does not own the video element (for example a game tile receiving a
 * `videoPlayer` node from SDUI) hear how playback went, so it can release its autoplay slot.
 */
export const VideoPlaybackAutoplayContext = createContext<
  VideoPlaybackAutoplayCallbacks | undefined
>(undefined);
