import type { VideoQualityPreference } from "@rbx/video-player";

/** Known `playbackBehavior` values from VideoPlayerSchema. */
export const VIDEO_PLAYBACK_BEHAVIOR = {
  PlayWhenReady: "PlayWhenReady",
} as const;

/**
 * Known `maxQuality` values from VideoPlayerSchema / `@rbx/video-player`.
 * Keys and values must cover `VideoQualityPreference` so a player type change fails the build.
 */
export const VIDEO_MAX_QUALITY = {
  standard: "standard",
  fhd: "fhd",
} as const satisfies Record<VideoQualityPreference, VideoQualityPreference>;

export type VideoMaxQuality = (typeof VIDEO_MAX_QUALITY)[keyof typeof VIDEO_MAX_QUALITY];

function isVideoMaxQuality(maxQuality: string): maxQuality is VideoMaxQuality {
  return Object.hasOwn(VIDEO_MAX_QUALITY, maxQuality);
}

export function resolveVideoMaxQuality(maxQuality?: string): VideoQualityPreference {
  if (maxQuality !== undefined && isVideoMaxQuality(maxQuality)) {
    return maxQuality;
  }
  return VIDEO_MAX_QUALITY.standard;
}
