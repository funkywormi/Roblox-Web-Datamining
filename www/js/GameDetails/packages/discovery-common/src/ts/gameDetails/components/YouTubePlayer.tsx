import React, { useRef, useEffect, useState, useCallback } from "react";
import youTubePlayer from "youtube-player";
import useAutoPlayVideoCarouselItem from "../hooks/useAutoPlayVideoCarouselItem";
import {
  getYouTubePlayerConfig,
  isYouTubePlayerEvent,
  YouTubePlayerState,
} from "../utils/youTubePlayerUtils";
import carouselConstants from "../constants/carouselConstants";

const { gameplayButtonContainerId } = carouselConstants;

type TYouTubePlayerProps = {
  videoHash: string;
  className: string;
  isActive: boolean;
  onPlay?: () => void;
  onPaused?: () => void;
  onEnd?: () => void;
};

const YouTubePlayer = ({
  videoHash,
  className,
  isActive,
  onPlay,
  onPaused,
  onEnd,
}: TYouTubePlayerProps): JSX.Element => {
  const internalPlayerRef = useRef<ReturnType<typeof youTubePlayer> | undefined>(undefined);

  const [isReady, setIsReady] = useState<boolean>(false);
  const [currentState, setCurrentState] = useState<YouTubePlayerState>(
    YouTubePlayerState.Unstarted,
  );

  // Create stable refs for the play, pause, and end handlers, but subscribe to updates using useEffect
  // Necessary because youtube-player is not a React library, and we don't want to depend on these handlers in
  // the useEffect that creates the YouTube player instance, or the player will be recreated on every render.
  const onPlayRef = useRef<(() => void) | undefined>(onPlay);
  const onPausedRef = useRef<(() => void) | undefined>(onPaused);
  const onEndRef = useRef<(() => void) | undefined>(onEnd);

  useEffect(() => {
    onPlayRef.current = onPlay;
    onPausedRef.current = onPaused;
    onEndRef.current = onEnd;
  }, [onPlay, onPaused, onEnd]);

  const playVideo = useCallback(() => {
    internalPlayerRef.current?.playVideo();
  }, []);

  const pauseVideo = useCallback(() => {
    internalPlayerRef.current?.pauseVideo();
  }, []);

  useAutoPlayVideoCarouselItem(
    isActive,
    isReady,
    currentState === YouTubePlayerState.Unstarted,
    currentState === YouTubePlayerState.Playing || currentState === YouTubePlayerState.Buffering,
    currentState === YouTubePlayerState.Ended,
    playVideo,
    pauseVideo,
  );

  const onReadyHandler = useCallback(() => {
    internalPlayerRef.current?.mute();

    setIsReady(true);
  }, []);

  const onPlayerStateChange = useCallback((event: unknown) => {
    if (!isYouTubePlayerEvent(event)) {
      return;
    }

    setCurrentState(event.data);

    switch (event.data) {
      case YouTubePlayerState.Playing:
      case YouTubePlayerState.Buffering:
        if (onPlayRef.current) {
          onPlayRef.current();
        }
        break;
      case YouTubePlayerState.Paused:
        if (onPausedRef.current) {
          onPausedRef.current();
        }
        break;
      case YouTubePlayerState.Ended:
        if (onEndRef.current) {
          onEndRef.current();
        }
        break;
      default:
        break;
    }
  }, []);

  // If the main game details play button is clicked on, stop playing the video
  useEffect(() => {
    const playButton = document.getElementById(gameplayButtonContainerId);
    if (playButton) {
      playButton.addEventListener("click", pauseVideo);

      return () => {
        playButton.removeEventListener("click", pauseVideo);
      };
    }

    return () => null;
  }, [pauseVideo]);

  useEffect(() => {
    internalPlayerRef.current = youTubePlayer(videoHash, getYouTubePlayerConfig(videoHash));
    internalPlayerRef.current.on("stateChange", onPlayerStateChange);
    internalPlayerRef.current.on("ready", onReadyHandler);

    return () => {
      internalPlayerRef.current?.destroy();
    };
  }, [videoHash, onPlayerStateChange, onReadyHandler]);

  return (
    <div className={className}>
      <div id={videoHash} />
    </div>
  );
};

YouTubePlayer.defaultProps = {
  onPlay: undefined,
  onPaused: undefined,
  onEnd: undefined,
};

export default YouTubePlayer;
