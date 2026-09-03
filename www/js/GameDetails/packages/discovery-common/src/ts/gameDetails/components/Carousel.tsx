import React, { useState, useRef, useEffect, useCallback } from "react";
import { TranslateFunction } from "@rbx/core-scripts/react";
import MediaCarouselItem from "./MediaCarouselItem";
import MediaCarouselScrollButtons from "./MediaCarouselScrollButtons";
import useSyncedState from "../../common/hooks/useSyncedState";
import useMediaCarouselAnalytics from "../hooks/useMediaCarouselAnalytics";
import { TCarouselItem } from "../types/carouselTypes";

// Returns true if the previous or next item is active (wrapping around the end of the items array).
const getIsNeighborActive = (
  index: number,
  activeIndex: number,
  numberOfItems: number,
): boolean => {
  const previousIndex = (index - 1 + numberOfItems) % numberOfItems;
  const nextIndex = (index + 1) % numberOfItems;

  return previousIndex === activeIndex || nextIndex === activeIndex;
};

type TCarouselProps = {
  items: TCarouselItem[];
  delay: number;
  placeName: string;
  universeId: string;
  placeId: string;
  handleItemFailure: (itemId: string) => void;
  translate: TranslateFunction;
};

/**
 * Renders the Experience Details page media carousel.
 * Controls auto advance logic that auto advances to the next item based on the delay time.
 * The auto advance logic pauses for 1) user mouse enter on the carousel or 2) any video is playing.
 */
const Carousel = ({
  items,
  delay,
  placeName,
  universeId,
  placeId,
  handleItemFailure,
  translate,
}: TCarouselProps): JSX.Element => {
  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  const [showControls, setShowControls, showControlsRef] = useSyncedState<boolean>(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isAnyVideoPlayingRef = useRef<boolean>(false);

  const { sendMediaGalleryMediaChangedEvent } = useMediaCarouselAnalytics(
    items,
    placeId,
    universeId,
  );

  const stopAutoAdvance = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const backToPreviousItem = useCallback(
    (isAutoAdvance: boolean) => {
      stopAutoAdvance();

      setSelectedIndex(prevIndex => {
        const newIndex = (prevIndex - 1 + items.length) % items.length;
        sendMediaGalleryMediaChangedEvent(newIndex, prevIndex, isAutoAdvance);
        return newIndex;
      });
    },
    [items.length, stopAutoAdvance, sendMediaGalleryMediaChangedEvent],
  );

  const advanceToNextItem = useCallback(
    (isAutoAdvance: boolean) => {
      stopAutoAdvance();

      setSelectedIndex(prevIndex => {
        const newIndex = (prevIndex + 1) % items.length;
        sendMediaGalleryMediaChangedEvent(newIndex, prevIndex, isAutoAdvance);
        return newIndex;
      });
    },
    [items.length, stopAutoAdvance, sendMediaGalleryMediaChangedEvent],
  );

  const tryStartAutoAdvance = useCallback(() => {
    // Do not start auto advance if the controls are shown or a video is playing
    if (showControlsRef.current || isAnyVideoPlayingRef.current) {
      return;
    }

    // Clear any existing auto advance timeout
    stopAutoAdvance();

    timeoutRef.current = setTimeout(() => {
      advanceToNextItem(true);
    }, delay);
  }, [stopAutoAdvance, advanceToNextItem, delay, showControlsRef]);

  const handleVideoPlay = useCallback(() => {
    stopAutoAdvance();
    isAnyVideoPlayingRef.current = true;
  }, [stopAutoAdvance]);

  const handleVideoPause = useCallback(() => {
    isAnyVideoPlayingRef.current = false;
    tryStartAutoAdvance();
  }, [tryStartAutoAdvance]);

  const handleVideoEnd = useCallback(() => {
    advanceToNextItem(true);
    isAnyVideoPlayingRef.current = false;
  }, [advanceToNextItem]);

  const handleCarouselFocus = useCallback(() => {
    setShowControls(true);
    stopAutoAdvance();
  }, [stopAutoAdvance, setShowControls]);

  const handleCarouselBlur = useCallback(() => {
    setShowControls(false);
    tryStartAutoAdvance();
  }, [tryStartAutoAdvance, setShowControls]);

  const handleManualBack = useCallback(() => {
    backToPreviousItem(false);
  }, [backToPreviousItem]);

  const handleManualAdvance = useCallback(() => {
    advanceToNextItem(false);
  }, [advanceToNextItem]);

  // Start a timer to advance to the next item whenever selectedIndex changes
  useEffect(() => {
    tryStartAutoAdvance();

    return () => {
      stopAutoAdvance();
    };
  }, [tryStartAutoAdvance, stopAutoAdvance, selectedIndex]);

  if (items.length === 0) {
    return <React.Fragment />;
  }

  return (
    <div
      data-testid="carousel"
      onFocus={handleCarouselFocus}
      onMouseEnter={handleCarouselFocus}
      onBlur={handleCarouselBlur}
      onMouseLeave={handleCarouselBlur}
    >
      {items.map((item, index) => (
        <MediaCarouselItem
          key={item.id}
          item={item}
          isActive={index === selectedIndex}
          isNeighborActive={getIsNeighborActive(index, selectedIndex, items.length)}
          universeId={universeId}
          placeName={placeName}
          index={index}
          translate={translate}
          handleItemFailure={handleItemFailure}
          handleVideoPlay={handleVideoPlay}
          handleVideoPause={handleVideoPause}
          handleVideoEnd={handleVideoEnd}
        />
      ))}
      {items.length > 1 && (
        <MediaCarouselScrollButtons
          showControls={showControls}
          back={handleManualBack}
          next={handleManualAdvance}
          translate={translate}
        />
      )}
    </div>
  );
};

export default Carousel;
