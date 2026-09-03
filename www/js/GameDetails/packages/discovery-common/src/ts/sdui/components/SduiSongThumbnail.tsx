import type { ReactElement } from "react";
import { ThumbnailFormat } from "@rbx/thumbnails";
import { SongThumbnail, type SongThumbnailProps } from "@rbx/song-details";
import { TSduiCommonProps } from "../system/SduiTypes";

type TSduiSongThumbnailProps = SongThumbnailProps & TSduiCommonProps;

/**
 * SDUI-registered wrapper for {@link SongThumbnail} so it can be used as a Tile
 * `imageComponent` (nested component config).
 */
const SduiSongThumbnail = ({
  assetId,
  width = 150,
  height = 150,
  format = ThumbnailFormat.webp,
  altName = "",
  hideOnError = false,
}: TSduiSongThumbnailProps): ReactElement => {
  return (
    <SongThumbnail
      assetId={assetId}
      width={width}
      height={height}
      format={format}
      altName={altName}
      hideOnError={hideOnError}
    />
  );
};

export default SduiSongThumbnail;
