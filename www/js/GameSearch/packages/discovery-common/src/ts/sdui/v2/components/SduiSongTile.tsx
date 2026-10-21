import React from "react";
import { SongThumbnail } from "@rbx/song-details";
import { SduiTileFooter } from "@rbx/sdui-common";
import { SduiGameTile, type SduiGameTileProps } from "@rbx/sdui-client";

const SONG_TILE_THUMBNAIL_SIZE = 150;

export interface SduiSongTileProps extends SduiGameTileProps {
  songId?: string;
  artistText?: string;
}

export function SduiSongTile({
  songId,
  artistText,
  image,
  imageComponent,
  footerComponent,
  onActivated,
  titleText,
  ...tileProps
}: SduiSongTileProps): React.JSX.Element {
  const hasSongId = songId !== undefined && songId !== "";
  const hasImage = typeof image === "string" && image !== "";
  // The template's `image` resolves to the same asset thumbnail, but a non-complete
  // thumbnail state renders the legacy broken-image icon. SongThumbnail degrades to
  // the music-note placeholder instead, so it wins over `image` whenever we have an id.
  const songThumbnail = hasSongId ? (
    <SongThumbnail
      assetId={songId}
      width={SONG_TILE_THUMBNAIL_SIZE}
      height={SONG_TILE_THUMBNAIL_SIZE}
      altName={titleText ?? ""}
    />
  ) : undefined;

  // Lua supplies OpenSongDetail when onActivated is omitted. Web does not
  // implement that component default today; the template must configure it.
  return (
    <SduiGameTile
      {...tileProps}
      titleText={titleText}
      image={hasImage && !hasSongId ? image : undefined}
      imageComponent={imageComponent ?? songThumbnail}
      footerComponent={
        footerComponent ??
        (artistText !== undefined && artistText !== "" ? (
          <SduiTileFooter leftText={artistText} />
        ) : undefined)
      }
      onActivated={onActivated}
    />
  );
}

export default SduiSongTile;
