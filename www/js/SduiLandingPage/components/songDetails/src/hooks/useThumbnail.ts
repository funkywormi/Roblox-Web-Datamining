import { useCallback, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  resolveThumbnail,
  retryPendingThumbnail,
  THUMBNAIL_PENDING,
  type ThumbnailFormat,
} from "@rbx/www-common/components/thumbnail";

export type UseThumbnailParams = {
  assetId: number | string;
  width: number;
  height: number;
  format: ThumbnailFormat;
};

export const thumbnailQueryKeys = {
  asset: (assetId: string | number, width: number, height: number, format: ThumbnailFormat) =>
    ["song-details", "thumbnail", "asset", String(assetId), width, height, format] as const,
};

async function fetchAssetThumbnailImageUrl(
  assetId: number | string,
  width: number,
  height: number,
  format: ThumbnailFormat,
): Promise<string> {
  const resolved = await resolveThumbnail({
    type: "Asset",
    targetId: Number(assetId),
    size: `${width}x${height}`,
    format,
  });
  if (resolved.state === "Completed") {
    return resolved.imageUrl;
  }
  if (resolved.state === "Pending") {
    throw THUMBNAIL_PENDING;
  }
  throw new Error("Thumbnail not available");
}

/**
 * Loads a catalog asset thumbnail URL via {@link resolveThumbnail} (cached with React Query)
 * and tracks decode / client load error state for the {@link HTMLImageElement}.
 */
export function useThumbnail({ assetId, width, height, format }: UseThumbnailParams): {
  thumbnailUrl: string | null;
  isLoading: boolean;
  isError: boolean;
  imgLoaded: boolean;
  onImageLoad: () => void;
  onImageError: () => void;
} {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgLoadFailed, setImgLoadFailed] = useState(false);

  const query = useQuery({
    queryKey: thumbnailQueryKeys.asset(assetId, width, height, format),
    queryFn: () => fetchAssetThumbnailImageUrl(assetId, width, height, format),
    enabled: Boolean(assetId),
    // Matches www-common Thumbnail2d: a resolved thumbnail never refetches, and only a Pending one
    // is polled. Set here so it holds under .NET's queryClient, which turns retry off.
    staleTime: Infinity,
    retry: retryPendingThumbnail,
  });

  useEffect(() => {
    setImgLoaded(false);
    setImgLoadFailed(false);
  }, [assetId, width, height, format]);

  const onImageLoad = useCallback(() => {
    setImgLoaded(true);
  }, []);

  const onImageError = useCallback(() => {
    setImgLoadFailed(true);
  }, []);

  if (!assetId) {
    return {
      thumbnailUrl: null,
      isLoading: false,
      isError: true,
      imgLoaded: false,
      onImageLoad,
      onImageError,
    };
  }

  const thumbnailUrl = query.data ?? null;
  const isError = imgLoadFailed || query.isError;
  const isLoading = !imgLoadFailed && query.isLoading;

  return { thumbnailUrl, isLoading, isError, imgLoaded, onImageLoad, onImageError };
}
