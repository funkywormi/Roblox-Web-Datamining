export const thumbnailTypes = [
  "Asset",
  "BundleThumbnail",
  "Avatar",
  "Outfit",
  "AvatarHeadShot",
  "GameIcon",
] as const;

export type ThumbnailType = (typeof thumbnailTypes)[number];

export type ThumbnailState = "Completed" | "Pending" | "Blocked" | "Error" | "InReview";

export type ThumbnailFormat = "webp" | "png" | "jpeg";

export const ThumbnailAvatarsSize = {
  size100: "100x100",
  size352: "352x352",
  size720: "720x720",
} as const;

export const ThumbnailGameIconSize = {
  size50: "50x50",
  size150: "150x150",
  size256: "256x256",
  size512: "512x512",
} as const;

export type ThumbnailRequest = {
  type: ThumbnailType;
  targetId: number | string;
  size?: string;
  format?: ThumbnailFormat;
  version?: number | string;
  headShape?: string;
  includeBackground?: boolean;
  /** AvatarHeadShot only — server composites the user's profile frame into the returned image. */
  includeProfileFrame?: boolean;
};

export type ResolvedThumbnail =
  | { state: "Completed"; imageUrl: string }
  | { state: "Pending" | "Blocked" | "Error" | "InReview" };
