import React, { useRef, useEffect, useImperativeHandle, forwardRef } from "react";
import youTubePlayer from "youtube-player";
import carouselConstants from "../constants/carouselConstants";

export type TYoutubePlayerRef = {
  pause: () => void;
  play: (seek?: number) => void;
  getCurrentTime: () => Promise<number>;
  getDuration: () => Promise<number>;
};

export enum PlayerState {
  Unstarted = -1,
  Ended = 0,
  Playing = 1,
  Paused = 2,
  Buffering = 3,
  Cued = 5,
}

const YouTubePlayer = (
  {
    id,
    className,
    onPlay,
    onPaused,
    onEnd,
    onReady,
  }: {
    id: string;
    className?: string;
    onPlay?: (event: CustomEvent) => void;
    onPaused?: (event: CustomEvent) => void;
    onEnd?: (event: CustomEvent) => void;
    onReady?: (event: CustomEvent) => void;
  },
  ref: React.Ref<TYoutubePlayerRef>,
): JSX.Element => {
  const internalPlayerRef = useRef<ReturnType<typeof youTubePlayer> | undefined>(undefined);

  const onPlayerStateChange = (event: CustomEvent & { data: PlayerState }) => {
    switch (event.data) {
      case PlayerState.Playing:
      case PlayerState.Buffering:
        if (onPlay) {
          onPlay(event);
        }
        break;
      case PlayerState.Paused:
        if (onPaused) {
          onPaused(event);
        }
        break;
      case PlayerState.Ended:
        if (onEnd) {
          onEnd(event);
        }
        break;

      default:
        break;
    }
  };

  const onReadyHandler = (e: CustomEvent) => {
    internalPlayerRef.current?.mute();
    if (onReady) {
      onReady(e);
    }
  };

  useImperativeHandle(ref, () => ({
    pause: () => {
      internalPlayerRef.current?.pauseVideo();
    },
    play: (seek?: number) => {
      if (seek !== undefined) {
        internalPlayerRef.current?.seekTo(seek, true);
      }
      internalPlayerRef.current?.playVideo();
    },
    getCurrentTime: async (): Promise<number> => {
      return (await internalPlayerRef.current?.getCurrentTime()) || -1;
    },
    getDuration: async (): Promise<number> => {
      return (await internalPlayerRef.current?.getDuration()) || -1;
    },
  }));

  useEffect(() => {
    internalPlayerRef.current = youTubePlayer(id, carouselConstants.youtubePlayerConfigs(id));
    internalPlayerRef.current.on("stateChange", onPlayerStateChange);
    internalPlayerRef.current.on("ready", onReadyHandler);
    return () => {
      internalPlayerRef.current?.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={className}>
      <div id={id} />
    </div>
  );
};

export default forwardRef(YouTubePlayer);
