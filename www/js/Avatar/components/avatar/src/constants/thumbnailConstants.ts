// Request type/size values formerly from @rbx/thumbnails.
export const ThumbnailTypes = {
  avatar: "Avatar",
  assetThumbnail: "Asset",
  bundleThumbnail: "BundleThumbnail",
  userOutfit: "Outfit",
  placeGameIcon: "PlaceGameIcon",
} as const;

export type ThumbnailTypeValue = (typeof ThumbnailTypes)[keyof typeof ThumbnailTypes];

export const ThumbnailAvatarsSize = {
  size352: "352x352",
} as const;

export const DefaultThumbnailSize = "150x150";
