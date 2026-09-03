import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  RobloxVideoPlayer,
  VideoPlayerRef,
  useVideoManifest,
  formatDuration
} from '@rbx/video-player';
import { Thumbnail2d, ThumbnailAssetsSize, ThumbnailTypes } from 'roblox-thumbnails';
import classNames from 'classnames';
import { DeviceMeta } from 'Roblox';
import { Typography, CloseIcon, IconButton, ReportProblemOutlinedIcon } from '@rbx/ui';
import getCurrentEnvironment from '../utils';
import videoService from '../services/videoService';
import { useGlobalModalVolume } from '../context/GlobalModalVolumeContext';

export interface VideoTileProps {
  assetId: string;
  groupId: number;
  mobileAutoPlay?: boolean;
  onVideoEnd?: (isModalOpen: boolean) => void;
  onClick?: () => void;
  onDismissModal: () => void;
}

const HOVER_DELAY = 250;
const environment = getCurrentEnvironment();

const VideoTile = React.memo(
  ({ assetId, groupId, mobileAutoPlay, onVideoEnd, onClick, onDismissModal }: VideoTileProps) => {
    const playerRef = useRef<VideoPlayerRef>(null);
    const playerWrapperRef = useRef<HTMLDivElement>(null);
    const overlayRef = useRef<HTMLDivElement>(null);
    const hoverTimeoutRef = useRef<number | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isHovering, setIsHovering] = useState(false);
    const [title, setTitle] = useState<string | null>(null);
    const [fallbackDuration, setFallbackDuration] = useState<number | null>(null);
    const [hasLoadError, setHasLoadError] = useState(false);
    const { isPhone } = DeviceMeta();
    const { globalVolume, globalMuted, updateGlobalModalVolume } = useGlobalModalVolume();

    // Use the useVideoManifest hook to get the video duration
    // We will pass the manifest to video to prevent duplicate fetches.
    const { durationInSeconds, manifest } = useVideoManifest({
      videoAssetId: assetId,
      environment: getCurrentEnvironment()
    });

    // Use manifest duration first, fallback to player duration
    const displayDuration = durationInSeconds || fallbackDuration;

    const handlePlayVideo = useCallback(() => {
      if (playerRef.current && playerRef.current.paused) {
        playerRef.current.play().catch(() => {
          /* TODO: HANDLE FAILURE STATE: https://roblox.atlassian.net/browse/BRANDPLAT-599 */
        });
      }
    }, []);

    const handleTogglePlayback = useCallback(() => {
      if (playerRef.current?.paused) {
        handlePlayVideo();
      } else {
        playerRef.current?.pause();
      }
    }, [handlePlayVideo]);

    const handleMouseEnter = useCallback(() => {
      // Clear any existing timeout
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
      // Set a 250ms delay before playing the video
      hoverTimeoutRef.current = setTimeout(() => {
        if (playerRef.current && !isModalOpen) {
          handlePlayVideo();
          setIsHovering(true);
        }
      }, HOVER_DELAY);
    }, [isModalOpen, playerRef, handlePlayVideo]);

    const handleMouseLeave = useCallback(() => {
      setIsHovering(false);
      // Clear the hover timeout when mouse leaves
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
        hoverTimeoutRef.current = null;
      }
      if (playerRef.current && !isModalOpen) {
        playerRef.current.reset();
      }
    }, [isModalOpen, playerRef]);

    const handleClick = useCallback(() => {
      if (isPhone && onClick) onClick();
      if (!isModalOpen) {
        setIsModalOpen(true);
        handlePlayVideo();
      } else {
        handleTogglePlayback();
      }
    }, [isPhone, onClick, isModalOpen, handleTogglePlayback, handlePlayVideo]);

    const handleLoadError = useCallback((error: Error) => {
      setHasLoadError(true);
    }, []);

    // When fullscreen, restore saved state
    useEffect(() => {
      if (isPhone || !playerRef.current || !isModalOpen) return;
      const video = playerRef.current;
      video.muted = globalMuted;
      video.volume = globalVolume;
    }, [isModalOpen, isPhone, globalMuted, globalVolume]);

    const handleCloseModal = useCallback(
      (e: React.SyntheticEvent) => {
        e.stopPropagation();
        setIsModalOpen(false);
        if (playerRef.current) {
          const video = playerRef.current;
          updateGlobalModalVolume(video.volume, video.muted);
          video.muted = true;
          if (isPhone) {
            onDismissModal();
          } else {
            video.reset();
          }
        }
      },
      [playerRef, updateGlobalModalVolume, isPhone, onDismissModal]
    );

    const handleLoadedDuration = useCallback(() => {
      // Get duration from video player as fallback when manifest doesn't provide it
      if (!durationInSeconds && playerRef.current) {
        const playerDuration = playerRef.current.duration;
        if (playerDuration && playerDuration > 0) {
          setFallbackDuration(Math.floor(playerDuration));
        }
      }
    }, [durationInSeconds]);

    const handleAccessibilityKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        if (!playerRef.current) return;
        e.stopPropagation();
        switch (e.key) {
          case 'Escape':
            handleCloseModal(e);
            break;
          case ' ':
            e.preventDefault();
            handleTogglePlayback();
            break;
          case 'm':
          case 'M':
            e.preventDefault();
            playerRef.current.muted = !playerRef.current.muted;
            break;
          default:
            break;
        }
      },
      [handleCloseModal, handleTogglePlayback, playerRef]
    );

    useEffect(() => {
      if (title) return;
      // eslint-disable-next-line no-void
      void videoService.getVideoTitle(assetId).then(fetchedTitle => {
        setTitle(fetchedTitle);
      });
    }, [assetId, title]);

    // Handle mobile autoplay changes
    // Note: The autoPlay prop on RobloxVideoPlayer only affects the initial load of the video.
    // When mobileAutoPlay changes from false to true (e.g., when moving to the next video),
    // we need to programmatically start the video since the autoPlay prop won't trigger
    // playback for already-loaded videos.
    useEffect(() => {
      if (!isPhone) return;
      if (mobileAutoPlay) {
        handlePlayVideo();
      } else if (!mobileAutoPlay) {
        playerRef.current?.reset();
      }
    }, [isPhone, mobileAutoPlay, handlePlayVideo]);

    useEffect(() => {
      if (isModalOpen && overlayRef.current) {
        overlayRef.current.focus();
      }
    }, [isModalOpen]);

    // Cleanup timeout on unmount
    useEffect(() => {
      return () => {
        if (hoverTimeoutRef.current) {
          clearTimeout(hoverTimeoutRef.current);
        }
      };
    }, []);

    const handleVideoEnded = useCallback(() => {
      onVideoEnd?.(isModalOpen);
    }, [isModalOpen, onVideoEnd]);

    // Error state
    if (hasLoadError) {
      return (
        <div
          className='group-videos-tile-container'
          role='button'
          tabIndex={0}
          onClick={handleClick}
          onKeyDown={handleAccessibilityKeyDown}>
          <div
            ref={playerWrapperRef}
            className={classNames('group-videos-tile-player-wrapper', {
              'has-error': true
            })}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            role='presentation'>
            <div className='group-videos-tile-thumbnail'>
              <Thumbnail2d
                type={ThumbnailTypes.assetThumbnail}
                targetId={Number(assetId)}
                altName={`Thumbnail for video ${assetId}`}
                size={ThumbnailAssetsSize.width256}
                containerClass='group-videos-tile-thumbnail-container'
                imgClassName='group-videos-tile-thumbnail-image'
              />
              {isHovering && (
                <div className='group-videos-tile-error-overlay'>
                  <ReportProblemOutlinedIcon
                    className='group-videos-tile-error-icon'
                    fontSize='large'
                  />
                </div>
              )}
            </div>
            {displayDuration && (
              <div className='group-videos-tile-duration'>{formatDuration(displayDuration)}</div>
            )}
          </div>
          {title && (
            <div className='group-videos-tile-title'>
              <Typography variant='captionHeader'>{title}</Typography>
            </div>
          )}
        </div>
      );
    }

    // Normal state render
    return (
      <div
        className='group-videos-tile-container'
        role='button'
        tabIndex={0}
        onClick={handleClick}
        onKeyDown={handleAccessibilityKeyDown}>
        {/* Modal overlay for desktop/tablet */}
        {isModalOpen && (
          <div
            ref={overlayRef}
            className={classNames('group-videos-modal-overlay-background', {
              'phone-background': isPhone
            })}
            onClick={handleCloseModal}
            onKeyDown={handleAccessibilityKeyDown}
            aria-label='Close modal'
            role='button'
            tabIndex={0}
          />
        )}
        {/* Close button for phone - positioned at top right of screen */}
        {isModalOpen && isPhone && (
          <IconButton
            aria-label='clear'
            onClick={handleCloseModal}
            variant='contained'
            color='onMediaLight'
            className='group-videos-modal-close-button-phone'>
            <CloseIcon />
          </IconButton>
        )}
        <div
          ref={playerWrapperRef}
          className={classNames('group-videos-tile-player-wrapper', {
            'group-videos-tile-modal-active': isModalOpen,
            'mobile-fullscreen': isModalOpen && isPhone
          })}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}>
          <RobloxVideoPlayer
            className='group-videos-tile-roblox-player'
            ref={playerRef}
            videoAssetId={assetId}
            environment={environment}
            muted={!isModalOpen || globalMuted}
            disableControls={!isModalOpen}
            manifest={manifest}
            fullscreenActive={isModalOpen}
            onHoverActive={isHovering}
            enableAnalytics
            analyticsConfig={{
              target: 'www',
              assetId,
              environment,
              completionThreshold: 100,
              source: 'community',
              sourceId: groupId.toString()
            }}
            autoPlay={isPhone && mobileAutoPlay}
            onEnded={handleVideoEnded}
            onLoadVideoEnd={handleLoadedDuration}
            controlsConfig={{
              initialVolume: globalVolume,
              isMobileView: isPhone
            }}
            onLoadError={handleLoadError}
          />

          {/* Close button for desktop/tablet - positioned on video */}
          {isModalOpen && !isPhone && (
            <IconButton
              aria-label='clear'
              onClick={handleCloseModal}
              variant='contained'
              color='onMediaLight'
              className='group-videos-modal-close-button'>
              <CloseIcon />
            </IconButton>
          )}

          {!isModalOpen && !(isPhone && mobileAutoPlay) && (
            <React.Fragment>
              <div className='group-videos-tile-thumbnail'>
                <Thumbnail2d
                  type={ThumbnailTypes.assetThumbnail}
                  targetId={Number(assetId)}
                  altName={`Thumbnail for video ${assetId}`}
                  size={ThumbnailAssetsSize.width256}
                  containerClass='group-videos-tile-thumbnail-container'
                  imgClassName='group-videos-tile-thumbnail-image'
                />
              </div>
              {displayDuration && (
                <div className='group-videos-tile-duration'>{formatDuration(displayDuration)}</div>
              )}
            </React.Fragment>
          )}
        </div>
        {title && (
          <div className='group-videos-tile-title'>
            <Typography variant='captionHeader'>{title}</Typography>
          </div>
        )}
      </div>
    );
  }
);

VideoTile.displayName = 'VideoTile';

export default VideoTile;
