import React, { useMemo } from "react";
import {
  Thumbnail2d,
  ThumbnailTypes,
  ThumbnailFormat,
  ThumbnailGameThumbnailSize,
} from "@rbx/thumbnails";

type TExperienceEventTileThumbnailProps = {
  eventThumbnailId: number | undefined;
  placeId: number | undefined;
  altText: string;
};

const ExperienceEventTileThumbnail = ({
  eventThumbnailId,
  placeId,
  altText,
}: TExperienceEventTileThumbnailProps): JSX.Element => {
  const thumbnailTargetId = useMemo(() => {
    if (eventThumbnailId !== undefined) {
      return eventThumbnailId;
    }

    return placeId ?? 0;
  }, [eventThumbnailId, placeId]);

  return (
    <Thumbnail2d
      type={ThumbnailTypes.assetThumbnail}
      size={ThumbnailGameThumbnailSize.width384}
      targetId={thumbnailTargetId}
      containerClass="brief-game-icon"
      format={ThumbnailFormat.jpeg}
      altName={altText}
    />
  );
};

export default ExperienceEventTileThumbnail;
