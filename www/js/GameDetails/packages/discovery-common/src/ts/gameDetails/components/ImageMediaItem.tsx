import { JSX } from "react";
import classnames from "classnames";
import { Thumbnail2d, ThumbnailUniverseThumbnailSize, ThumbnailTypes } from "@rbx/thumbnails";
import { TAssetType, TCarouselAssetItem } from "../types/carouselTypes";
import { TranslateFunction } from "@rbx/core-scripts/react";

type TImageMediaItemProps = {
  item: TCarouselAssetItem;
  isActive: boolean;
  isNeighborActive: boolean;
  placeName: string;
  index: number;
  translate: TranslateFunction;
};

const getThumbnailType = (type: TAssetType): ThumbnailTypes => {
  if (type === TAssetType.Image) {
    return ThumbnailTypes.assetThumbnail;
  }

  return ThumbnailTypes.gameThumbnail;
};

/**
 * Renders an Image Media Item using Thumbnail2d (asset or game thumbnail, depending on item.type).
 */
const ImageMediaItem = ({
  item,
  isActive,
  isNeighborActive,
  placeName,
  index,
  translate,
}: TImageMediaItemProps): JSX.Element => {
  return (
    <Thumbnail2d
      type={getThumbnailType(item.type)}
      size={ThumbnailUniverseThumbnailSize.width768}
      targetId={item.assetId}
      altName={
        item.altText ??
        translate("Label.DefaultGameImageAltText", { imageNum: index + 1, placeName })
      }
      containerClass={classnames("carousel-item", {
        "carousel-item-active": isActive,
        "carousel-item-active-out": isNeighborActive,
      })}
    />
  );
};

export default ImageMediaItem;
