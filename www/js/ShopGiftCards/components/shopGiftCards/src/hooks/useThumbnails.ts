import { useCallback, useEffect, useState } from "react";
import { getThumbnails, ThumbnailData } from "../services/thumbnailService";

export type ThumbnailMap = Record<number, string>;

export type UseThumbnailsResult = {
  thumbnails: ThumbnailMap;
  loading: boolean;
};

export default function useThumbnails(assetIds: number[]): UseThumbnailsResult {
  const [thumbnails, setThumbnails] = useState<ThumbnailMap>({});
  const [loading, setLoading] = useState<boolean>(true);

  const fetchThumbnails = useCallback(async () => {
    if (assetIds.length === 0) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data } = await getThumbnails(assetIds);
    const thumbnailMap: ThumbnailMap = {};

    data.data.forEach((thumbnail: ThumbnailData) => {
      if (thumbnail.imageUrl) {
        thumbnailMap[thumbnail.targetId] = thumbnail.imageUrl;
      }
    });

    setThumbnails(thumbnailMap);
    setLoading(false);
  }, [assetIds]);

  useEffect(() => {
    // eslint-disable-next-line no-void
    void fetchThumbnails();
  }, [fetchThumbnails]);

  return { thumbnails, loading };
}
