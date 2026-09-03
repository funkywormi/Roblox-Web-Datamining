import React, { useCallback, useEffect, useRef, useState } from 'react';
import { UIThemeProvider } from '@rbx/ui';
import { useTheme, useTranslation } from 'react-utilities';
import { DeviceMeta } from 'Roblox';
import classNames from 'classnames';
import { useGroupVideosContext } from '../context/GroupVideosContext';
import ItemCarousel from '../../shared/components/ItemCarousel';
import VideoTile from './VideoTile';
import { GlobalModalVolumeProvider } from '../context/GlobalModalVolumeContext';

const GroupVideosSection: React.FC = React.memo(() => {
  const theme = useTheme();
  const videoContext = useGroupVideosContext();
  const { translate } = useTranslation();
  const { isPhone } = DeviceMeta();
  const carouselRef = useRef<HTMLDivElement>(null);
  const scrollStopTimeoutRef = useRef<number | null>(null);
  const prevDelayOnVideoEndRef = useRef<boolean>(false);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [delayOnVideoEnd, setDelayOnVideoEnd] = useState(false);

  // Scroll to the current video tile when the component mounts or when the current index changes
  useEffect(() => {
    if (!isPhone || !carouselRef.current) return;
    const tile = carouselRef.current.children?.[currentVideoIndex] as HTMLElement;
    if (tile) {
      const carouselRect = carouselRef.current.getBoundingClientRect();
      const tileRect = tile.getBoundingClientRect();
      const scrollLeft = tile.offsetLeft - carouselRect.width / 2 + tileRect.width / 2;
      carouselRef.current.scrollTo({
        left: scrollLeft,
        behavior: 'smooth'
      });
    }
  }, [currentVideoIndex, isPhone]);

  const handleMoveToNextVideo = useCallback(() => {
    setCurrentVideoIndex(prev => {
      const next = prev + 1;
      return next < videoContext.videosData.assetIds.length ? next : prev;
    });
  }, [videoContext]);

  const handleVideoEnded = useCallback(
    (isModalOpen: boolean) => {
      if (!isPhone) return;
      if (isModalOpen) {
        setDelayOnVideoEnd(true);
        return;
      }
      handleMoveToNextVideo();
    },
    [isPhone, handleMoveToNextVideo]
  );

  const handleCarouselScroll = useCallback(() => {
    if (scrollStopTimeoutRef.current) {
      clearTimeout(scrollStopTimeoutRef.current);
    }

    // Set a delay to debounce the scroll event
    scrollStopTimeoutRef.current = setTimeout(() => {
      if (!carouselRef.current) return;
      const children = Array.from(carouselRef.current.children);
      const carouselRect = carouselRef.current.getBoundingClientRect();
      let minDiff = Infinity;
      let newIndex = 0;
      const carouselCenter = (carouselRect.left + carouselRect.right) / 2;

      children.forEach((child, idx) => {
        const rect = child.getBoundingClientRect();
        const centerDiff = Math.abs((rect.left + rect.right) / 2 - carouselCenter);
        if (centerDiff < minDiff) {
          minDiff = centerDiff;
          newIndex = idx;
        }
      });

      setCurrentVideoIndex(newIndex);
    }, 200);
  }, []);

  const handleTileClick = useCallback(
    (index: number) => {
      if (isPhone && index !== currentVideoIndex) {
        setCurrentVideoIndex(index);
      }
    },
    [isPhone, currentVideoIndex]
  );

  // Handle automatic progression to next video when delayOnVideoEnd state changes from true to false on Mobile
  // This ensures videos only auto-advance after modal is dismissed, not during modal playback
  useEffect(() => {
    if (prevDelayOnVideoEndRef.current && !delayOnVideoEnd) {
      handleMoveToNextVideo();
    }
    // Update the previous value
    prevDelayOnVideoEndRef.current = delayOnVideoEnd;
  }, [delayOnVideoEnd, handleMoveToNextVideo]);

  return (
    <UIThemeProvider
      theme={theme === 'dark' ? 'foundation-dark' : 'foundation-light'}
      cssBaselineMode='disabled'>
      <div className='container-header'>
        <h2>{translate('Videos')}</h2>
      </div>
      <div className='group-videos-container'>
        <ItemCarousel
          scrollRef={carouselRef}
          onScroll={handleCarouselScroll}
          controlsClassName='group-videos-carousel-controls'>
          <GlobalModalVolumeProvider>
            {videoContext.videosData.assetIds.map((assetId, index) => {
              return (
                <div
                  key={assetId}
                  className={classNames('group-videos-carousel-videoTile', {
                    'group-videos-carousel-videoTile-leftEdge': index === 0,
                    'group-videos-carousel-videoTile-rightEdge':
                      index === videoContext.videosData.assetIds.length - 1
                  })}>
                  <VideoTile
                    assetId={assetId.toString()}
                    groupId={videoContext.groupId}
                    mobileAutoPlay={isPhone && index === currentVideoIndex}
                    onVideoEnd={handleVideoEnded}
                    onClick={() => handleTileClick(index)}
                    onDismissModal={() => {
                      setDelayOnVideoEnd(false);
                    }}
                  />
                </div>
              );
            })}
          </GlobalModalVolumeProvider>
        </ItemCarousel>
      </div>
    </UIThemeProvider>
  );
});

GroupVideosSection.displayName = 'GroupVideosSection';

export default GroupVideosSection;
