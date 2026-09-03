import React, { useCallback } from "react";
import YouTubeMediaItem from "./YouTubeMediaItem";
import ImageMediaItem from "./ImageMediaItem";
import GamePreviewVideoMediaItem from "./GamePreviewVideoMediaItem";
import { TAssetType, TCarouselItem } from "../types/carouselTypes";
import { TranslateFunction } from "@rbx/core-scripts/react";

type TMediaCarouselItemProps = {
  item: TCarouselItem;
  isActive: boolean;
  isNeighborActive: boolean;
  universeId: string;
  placeName: string;
  index: number;
  translate: TranslateFunction;
  handleItemFailure: (itemId: string) => void;

  // Video play/pause/end handlers for the YouTube and Game Preview Video item types
  handleVideoPlay?: () => void;
  handleVideoPause?: () => void;
  handleVideoEnd?: () => void;
};

/**
 * Renders a Media Carousel Item based on the item type (image or YouTube or Game Preview Video).
 */
const MediaCarouselItem = ({
  item,
  isActive,
  isNeighborActive,
  universeId,
  placeName,
  index,
  translate,
  handleItemFailure,
  handleVideoPlay,
  handleVideoPause,
  handleVideoEnd,
}: TMediaCarouselItemProps): JSX.Element | null => {
  const handleFailure = useCallback(() => {
    handleItemFailure(item.id);
  }, [handleItemFailure, item.id]);

  switch (item.type) {
    case TAssetType.Image:
    case TAssetType.Place:
      return (
        <ImageMediaItem
          item={item}
          isActive={isActive}
          isNeighborActive={isNeighborActive}
          placeName={placeName}
          index={index}
          translate={translate}
        />
      );
    case TAssetType.YouTubeVideo:
      return (
        <YouTubeMediaItem
          item={item}
          isActive={isActive}
          isNeighborActive={isNeighborActive}
          handleVideoPlay={handleVideoPlay}
          handleVideoPause={handleVideoPause}
          handleVideoEnd={handleVideoEnd}
        />
      );
    case TAssetType.GamePreviewVideo:
      return (
        <GamePreviewVideoMediaItem
          item={item}
          isActive={isActive}
          isNeighborActive={isNeighborActive}
          universeId={universeId}
          handleFailure={handleFailure}
          handleVideoPlay={handleVideoPlay}
          handleVideoPause={handleVideoPause}
          handleVideoEnd={handleVideoEnd}
        />
      );
    default:
      return null;
  }
};

export default MediaCarouselItem;
