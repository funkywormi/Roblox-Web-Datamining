/* eslint-disable */

import React, {
  useState,
  useRef,
  useEffect,
  useImperativeHandle,
  forwardRef,
  FocusEvent,
} from "react";
import classnames from "classnames";
import { Button } from "@rbx/core-ui/legacy/react-style-guide";
import { TranslateFunction } from "@rbx/core-scripts/legacy/react-utilities";
import { Thumbnail2d, ThumbnailTypes, ThumbnailUniverseThumbnailSize } from "@rbx/thumbnails";
import { TAssetType, TCarouselItem } from "../types/carouselTypes";
import YouTubePlayer, { TYoutubePlayerRef } from "./YouTubePlayer";
import carouselConstants from "../constants/carouselConstants";

export type TCarouselRef = {
  start: () => void;
  stop: () => void;
  next: () => Promise<void>;
  back: () => void;
};

const Carousel = (
  {
    items,
    delay,
    translate,
  }: {
    items: TCarouselItem[];
    delay: number;
    translate: TranslateFunction;
  },
  ref: React.Ref<TCarouselRef>,
): JSX.Element => {
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [showControls, setShowControls] = useState<boolean>(false);
  const showControlsRef = useRef<boolean>(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState<boolean>(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const selectedIndexRef = useRef<number>(selectedIndex);
  const youtubeVideoRefs = useRef<Record<number, TYoutubePlayerRef>>({});

  const stopAllVideo = () => {
    if (youtubeVideoRefs.current) {
      Object.values(youtubeVideoRefs.current).forEach(youtubeVideoRef => {
        youtubeVideoRef.pause();
      });
    }
  };

  const next = async (event?: React.MouseEvent<HTMLButtonElement>) => {
    event?.preventDefault();
    stopAllVideo();
    const nextIndex = (selectedIndexRef.current + 1) % items.length;
    setSelectedIndex(nextIndex);
    selectedIndexRef.current = nextIndex;

    start();

    if (items[nextIndex]?.type === TAssetType.YouTubeVideo) {
      const video = youtubeVideoRefs.current?.[nextIndex];
      if (video) {
        const duration = Math.ceil(await video.getDuration());
        const currentTime = Math.ceil(await video.getCurrentTime());
        // Duration and current time don't seem to be totally exact
        if (
          (currentTime <= 0 || currentTime >= duration) &&
          selectedIndexRef.current === nextIndex
        ) {
          video.play(0);
        }
      }
    }
  };

  const back = (event?: React.MouseEvent<HTMLButtonElement>) => {
    event?.preventDefault();
    stopAllVideo();
    const nextIndex =
      selectedIndexRef.current - 1 < 0 ? items.length - 1 : selectedIndexRef.current - 1;
    setSelectedIndex(nextIndex);
    selectedIndexRef.current = nextIndex;

    start();
  };

  const stop = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  const start = () => {
    stop();
    // NOTE (07/22/21, jcountrymam): Carousel should not
    // transition when video is playing and controls are not shown
    if (!isVideoPlaying && !showControlsRef.current) {
      timeoutRef.current = setTimeout(() => {
        next();
      }, delay);
    }
  };

  useEffect(() => {
    start();
    document
      .getElementById(carouselConstants.gameplayButtonContainerId)
      ?.addEventListener("click", stopAllVideo);

    return () => {
      stop();
      document
        .getElementById(carouselConstants.gameplayButtonContainerId)
        ?.removeEventListener("click", stopAllVideo);
    };
  }, []);

  useImperativeHandle(ref, () => ({
    start,
    stop,
    next,
    back,
  }));

  const getThumbnailType = (type: string): ThumbnailTypes => {
    if (type === TAssetType.Image) return ThumbnailTypes.assetThumbnail;
    return ThumbnailTypes.gameThumbnail as ThumbnailTypes;
  };

  const onBlur = (event: FocusEvent) => {
    // Blur events for these buttons are bubbled up when interacting with the Youtube player
    // To prevent unintended behavior in parent elements with good keyboard navigation support,
    // stop the propagation of those events here.
    event.stopPropagation();
  };

  return (
    <div
      data-testid="carousel"
      onFocus={() => {
        setShowControls(true);
        showControlsRef.current = true;
        stop();
      }}
      onBlur={() => {
        setShowControls(false);
        showControlsRef.current = false;
        start();
      }}
      onMouseEnter={() => {
        setShowControls(true);
        showControlsRef.current = true;
        stop();
      }}
      onMouseLeave={() => {
        setShowControls(false);
        showControlsRef.current = false;
        start();
      }}
    >
      {items.length > 1 && (
        <React.Fragment>
          <Button
            className={classnames("carousel-controls", "carousel-controls-left", {
              "carousel-controls-visible": showControls,
            })}
            onClick={back}
            onBlur={onBlur}
            aria-label={translate(carouselConstants.carouselTranslationMap.back)}
          >
            <span className="icon-carousel-left" />
          </Button>
          <Button
            className={classnames("carousel-controls", "carousel-controls-right", {
              "carousel-controls-visible": showControls,
            })}
            onClick={next}
            onBlur={onBlur}
            aria-label={translate(carouselConstants.carouselTranslationMap.next)}
          >
            <span className="icon-carousel-right" />
          </Button>
        </React.Fragment>
      )}
      {items.map((item, index) => {
        switch (item.type) {
          case TAssetType.Image:
          case TAssetType.Place:
            return (
              <Thumbnail2d
                key={item.assetId}
                type={getThumbnailType(item.type)}
                size={ThumbnailUniverseThumbnailSize.width768}
                targetId={item.assetId}
                altName={item.altText}
                containerClass={classnames("carousel-item", {
                  "carousel-item-active": index === selectedIndex,
                  "carousel-item-active-out":
                    index === (selectedIndex - 1 < 0 ? items.length - 1 : selectedIndex - 1) ||
                    index === (selectedIndex + 1) % items.length,
                })}
              />
            );
          case TAssetType.YouTubeVideo:
            return (
              <YouTubePlayer
                ref={youTubePlayerRef => {
                  if (youTubePlayerRef) {
                    youtubeVideoRefs.current[index] = youTubePlayerRef;
                  }
                }}
                id={item.videoHash}
                key={item.videoHash}
                className={classnames("carousel-item", "carousel-video", {
                  "carousel-item-active": index === selectedIndex,
                  "carousel-item-active-out":
                    index === (selectedIndex - 1 < 0 ? items.length - 1 : selectedIndex - 1) ||
                    index === (selectedIndex + 1) % items.length,
                })}
                onPlay={() => {
                  stop();
                  setIsVideoPlaying(true);
                }}
                onPaused={() => {
                  start();
                  setIsVideoPlaying(false);
                }}
                onEnd={() => {
                  next();
                  setIsVideoPlaying(false);
                }}
                onReady={() => {
                  if (index === 0 && selectedIndexRef.current === index) {
                    youtubeVideoRefs.current?.[index]!.play(0);
                  }
                }}
              />
            );
          default:
            return null;
        }
      })}
    </div>
  );
};

export default forwardRef(Carousel);
