import { useMemo } from "react";
import {
  Thumbnail2d,
  ThumbnailTypes,
  ThumbnailGameThumbnailSize,
  ThumbnailFormat,
} from "@rbx/thumbnails";
import { getThumbnailOverrideAssetId } from "../utils/parsingUtils";
import { TGameData } from "../types/bedev1Types";
import { TComponentType } from "../types/bedev2Types";
import useValidatedThumbnailOverride from "../hooks/useValidatedThumbnailOverride";

type TWideGameThumbnailProps = {
  gameData: TGameData;
  topicId: string | undefined;
  wideTileType: TComponentType;
  sizeOverride?: ThumbnailGameThumbnailSize;
};

const WideGameThumbnail = ({
  gameData,
  topicId,
  wideTileType,
  sizeOverride,
}: TWideGameThumbnailProps): JSX.Element => {
  const thumbnailAssetId: number | null = useMemo(() => {
    return getThumbnailOverrideAssetId(gameData, topicId);
  }, [gameData, topicId]);

  const thumbnailSize = useMemo<ThumbnailGameThumbnailSize>(() => {
    if (sizeOverride) {
      return sizeOverride;
    }
    if (wideTileType === TComponentType.EventTile) {
      return ThumbnailGameThumbnailSize.width576;
    }
    return ThumbnailGameThumbnailSize.width384;
  }, [sizeOverride, wideTileType]);

  const thumbnailOverride = useValidatedThumbnailOverride({
    assetId: thumbnailAssetId,
    size: thumbnailSize,
    topicId,
    telemetrySource: "WideGameThumbnail",
  });

  const shouldShowShimmer = thumbnailOverride.status === "loading";

  const shouldUseGameThumbnail =
    thumbnailAssetId === null || thumbnailOverride.status === "fallback";

  if (shouldShowShimmer) {
    return (
      <span
        data-testid="wide-game-thumbnail-shimmer"
        className="thumbnail-2d-container brief-game-icon shimmer"
      />
    );
  }

  const thumbnailType = shouldUseGameThumbnail
    ? ThumbnailTypes.gameThumbnail
    : ThumbnailTypes.assetThumbnail;

  const thumbnailTargetId = shouldUseGameThumbnail ? gameData.placeId : thumbnailAssetId;

  const validatedThumbnailProps =
    thumbnailOverride.status === "override" ? { getThumbnail: thumbnailOverride.getThumbnail } : {};

  return (
    <Thumbnail2d
      type={thumbnailType}
      size={thumbnailSize}
      targetId={thumbnailTargetId}
      containerClass="brief-game-icon"
      format={ThumbnailFormat.jpeg}
      altName={gameData.name}
      {...validatedThumbnailProps}
    />
  );
};

export default WideGameThumbnail;
