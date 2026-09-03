import React from "react";
import classnames from "classnames";
import {
  Thumbnail2d,
  ThumbnailTypes,
  ThumbnailFormat,
  ThumbnailGameThumbnailSize,
} from "@rbx/thumbnails";
import GamePreviewVideoPlayer from "./GamePreviewVideoPlayer";
import { PageContext } from "../../common/types/pageContext";
import type { TCarouselGamePreviewVideoItem } from "../types/carouselTypes";

type TGamePreviewVideoMediaItemProps = {
  item: TCarouselGamePreviewVideoItem;
  isActive: boolean;
  isNeighborActive: boolean;
  universeId: string;
  handleFailure: () => void;
  handleVideoPlay?: () => void;
  handleVideoPause?: () => void;
  handleVideoEnd?: () => void;
};

/**
 * Renders a Game Preview Video Media Item using the GamePreviewVideoPlayer component.
 */
const GamePreviewVideoMediaItem = ({
  item,
  isActive,
  isNeighborActive,
  universeId,
  handleFailure,
  handleVideoPlay,
  handleVideoPause,
  handleVideoEnd,
}: TGamePreviewVideoMediaItemProps): JSX.Element => {
  return (
    <GamePreviewVideoPlayer
      videoAssetId={item.videoId}
      isActive={isActive}
      handleFailure={handleFailure}
      page={PageContext.GameDetailPage}
      className={classnames("carousel-item", "carousel-video", "game-preview-video-container", {
        "carousel-item-active": isActive,
        "carousel-item-active-out": isNeighborActive,
      })}
      universeId={universeId}
      loadingComponent={
        <React.Fragment>
          <div className="thumbnail-shimmer-overlay shimmer" />
          <Thumbnail2d
            type={ThumbnailTypes.assetThumbnail}
            size={ThumbnailGameThumbnailSize.width768}
            targetId={item.imageId.toString()}
            containerClass="video-preview-thumbnail-container"
            format={ThumbnailFormat.webp}
          />
        </React.Fragment>
      }
      onPlay={handleVideoPlay}
      onPaused={handleVideoPause}
      onEnd={handleVideoEnd}
    />
  );
};

export default GamePreviewVideoMediaItem;
