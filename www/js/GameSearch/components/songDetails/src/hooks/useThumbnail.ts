import { useCallback, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  thumbnailService,
  ThumbnailFormat,
  ThumbnailStates,
  ThumbnailTypes,
} from "@rbx/thumbnails";

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
  const data = await thumbnailService.getThumbnailImage(
    ThumbnailTypes.assetThumbnail,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- thumbnailService expects a string union we can't import
    `${width}x${height}` as Parameters<typeof thumbnailService.getThumbnailImage>[1],
    format,
    Number(assetId),
  );
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- thumbnailService response shape not exported as a stable type
  const { thumbnail } = data as { thumbnail: { state: string; imageUrl?: string } };
  const { state, imageUrl } = thumbnail;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison -- comparing against known enum member
  if (state === ThumbnailStates.complete && imageUrl) {
    return imageUrl;
  }
  throw new Error("Thumbnail not available");
}

/**
 * Loads a catalog asset thumbnail URL via {@link thumbnailService} (cached with React Query)
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
