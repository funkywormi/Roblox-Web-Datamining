import { Options } from "youtube-player/dist/types";

// The possible states of the YouTube player.
export enum YouTubePlayerState {
  Unstarted = -1,
  Ended = 0,
  Playing = 1,
  Paused = 2,
  Buffering = 3,
  Cued = 5,
}

type TYoutubePlayerEvent = {
  data: YouTubePlayerState;
};

/**
 * Type assertion to check if the event is a YouTube player event.
 */
export const isYouTubePlayerEvent = (event: unknown): event is TYoutubePlayerEvent => {
  if (typeof event !== "object" || event === null || !("data" in event)) {
    return false;
  }

  const eventWithData = event as { data: YouTubePlayerState };

  return (
    typeof eventWithData.data === "number" &&
    Object.values(YouTubePlayerState).includes(eventWithData.data)
  );
};

/**
 * Returns the YouTube player config for the given video hash.
 */
export const getYouTubePlayerConfig = (videoHash: string): Options => ({
  width: 768,
  height: 432,
  videoId: videoHash,
  host: "https://www.youtube-nocookie.com",
  playerVars: {
    cc_load_policy: 1,
    modestbranding: 1,
    rel: 0,
  },
});

export default {
  isYouTubePlayerEvent,
  getYouTubePlayerConfig,
};
