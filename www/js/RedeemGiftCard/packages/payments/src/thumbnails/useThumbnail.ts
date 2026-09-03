import { useEffect, useState } from "react";
import { getThumbnails, ThumbnailType } from "./thumbnailsService";

// Returns the completed image URL for a single target, or null while loading / on failure.
export function useThumbnail(
  type: ThumbnailType,
  targetId: number | string,
  size: string,
  format: string,
): string | null {
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    // Drop the previous target's image so it doesn't linger if the new fetch fails or isn't Completed.
    setImageUrl(null);

    // eslint-disable-next-line no-void
    void (async () => {
      const response = await getThumbnails([{ requestId: targetId, targetId, type, size, format }]);
      const thumbnail = response?.data?.find(t => t.state === "Completed");

      if (!cancelled && thumbnail) {
        setImageUrl(thumbnail.imageUrl);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [type, targetId, size, format]);

  return imageUrl;
}
