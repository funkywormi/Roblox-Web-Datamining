import { useQuery } from "@tanstack/react-query";

import {
  thumbnailService,
  ThumbnailTypes,
  ThumbnailAvatarHeadshotSize,
  ThumbnailFormat,
} from "@rbx/thumbnails";

const isThumbnailDataItem = (data: unknown): data is { thumbnail?: { imageUrl?: string | null } } =>
  typeof data === "object" && data !== null;

const fetchHeadshotUrl = async (userId: number): Promise<string | null> => {
  const data = await thumbnailService.getThumbnailImage(
    ThumbnailTypes.avatarHeadshot,
    ThumbnailAvatarHeadshotSize.size150,
    ThumbnailFormat.webp,
    userId,
    undefined, // token
    undefined, // version
    undefined, // headShape
    undefined, // includeBackground (leave to the background experiment)
    true, // includeProfileFrame — ungated on this surface
  );
  return isThumbnailDataItem(data) ? (data.thumbnail?.imageUrl ?? null) : null;
};

/**
 * Returns the avatar headshot URL for a user. The URL is fetched once via
 * {@link thumbnailService} and cached by React Query, so chat bubbles mounted
 * after the first load read the cached URL instead of each re-fetching and
 * flashing in their own thumbnail.
 */
const useUserHeadshotUrl = (userId: number): string | null => {
  const { data } = useQuery({
    queryKey: ["c3ChatUserHeadshot", userId],
    queryFn: () => fetchHeadshotUrl(userId),
    enabled: Boolean(userId),
  });

  return data ?? null;
};

export default useUserHeadshotUrl;
