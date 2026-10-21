import { Icon } from "@rbx/foundation-ui";
import { ThumbnailFormat } from "@rbx/thumbnails";

import { useThumbnail } from "../hooks/useThumbnail";

export type SongThumbnailProps = {
  /** Roblox catalog audio asset id. */
  assetId: number | string;
  /** Thumbnail width in pixels (sent to the API and used for placeholder sizing). */
  width?: number;
  /** Thumbnail height in pixels (sent to the API and used for placeholder sizing). */
  height?: number;
  /** Image format (default webp). */
  format?: ThumbnailFormat;
  /** Accessible name for the image. */
  altName?: string;
  /** When true, render nothing instead of the fallback icon on error. */
  hideOnError?: boolean;
};

/** Matches the `loading` class used by Thumbnail.jsx to hide the <img> until fully decoded. */
const IMG_CLASS_BASE = "width-full h-full object-cover";
const IMG_CLASS_LOADING = `${IMG_CLASS_BASE} loading`;

/**
 * Fetches a catalog asset thumbnail directly via the thumbnail service and
 * renders it as an `<img>`.  Falls back to a music-note icon when the API
 * returns a non-complete state or the image fails to load.
 */
const SongThumbnail = ({
  assetId,
  width = 768,
  height = 432,
  format = ThumbnailFormat.webp,
  altName = "",
  hideOnError = false,
}: SongThumbnailProps) => {
  const { thumbnailUrl, isLoading, isError, imgLoaded, onImageLoad, onImageError } = useThumbnail({
    assetId,
    width,
    height,
    format,
  });

  const containerStyle = { aspectRatio: `${width} / ${height}`, overflow: "hidden" };

  if (isError) {
    if (hideOnError) {
      return null;
    }
    return (
      <div
        className="bg-shift-200 flex items-center justify-center radius-large width-full"
        style={containerStyle}
        aria-hidden
      >
        <Icon name="icon-filled-music-note" size="XLarge" />
      </div>
    );
  }

  return (
    <div className="width-full radius-large bg-shift-200" style={containerStyle}>
      {thumbnailUrl ? (
        <img
          className={imgLoaded ? IMG_CLASS_BASE : IMG_CLASS_LOADING}
          src={thumbnailUrl}
          alt={altName}
          title={altName}
          onLoad={onImageLoad}
          onError={onImageError}
        />
      ) : (
        <div className="width-full h-full shimmer" aria-busy={isLoading} />
      )}
    </div>
  );
};

export default SongThumbnail;
