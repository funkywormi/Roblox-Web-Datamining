import React from "react";
import classnames from "classnames";
import YouTubePlayer from "./YouTubePlayer";
import type { TCarouselYouTubeVideoItem } from "../types/carouselTypes";

type TYouTubeMediaItemProps = {
  item: TCarouselYouTubeVideoItem;
  isActive: boolean;
  isNeighborActive: boolean;
  handleVideoPlay?: () => void;
  handleVideoPause?: () => void;
  handleVideoEnd?: () => void;
};

/**
 * Renders a YouTube Media Item using the YouTubePlayer component.
 */
const YouTubeMediaItem = ({
  item,
  isActive,
  isNeighborActive,
  handleVideoPlay,
  handleVideoPause,
  handleVideoEnd,
}: TYouTubeMediaItemProps): JSX.Element => {
  return (
    <YouTubePlayer
      videoHash={item.videoHash}
      className={classnames("carousel-item", "carousel-video", {
        "carousel-item-active": isActive,
        "carousel-item-active-out": isNeighborActive,
      })}
      isActive={isActive}
      onPlay={handleVideoPlay}
      onPaused={handleVideoPause}
      onEnd={handleVideoEnd}
    />
  );
};

export default YouTubeMediaItem;
