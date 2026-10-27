import {
  Component,
  Fragment,
  useCallback,
  useEffect,
  useState,
  type ErrorInfo,
  type JSX,
  type ReactNode,
} from "react";
import classNames from "classnames";
import { window as browserWindow } from "@rbx/core-lib/browser";
import {
  ANIMATED_THUMBNAIL_EXTERNAL_POLL_ATTEMPTS,
  ANIMATION_PREVIEW_FADE_MS,
  fetchAnimationThumbnailMeta,
  getAnimationThumbnailMetaRequest,
} from "../utils/animationPreview";

type AnimatedAssetThumbnailProps = {
  children: ReactNode;
  isPlaying: boolean;
  targetId: number;
  previewKey?: string;
};

type AnimatedThumbnailProps = {
  targetId: number;
  getThumbnailJson?: () => Promise<{ data: unknown }>;
  onFailure?: () => void;
  onSuccess?: () => void;
};

type AnimatedThumbnailComponent = (props: AnimatedThumbnailProps) => JSX.Element;

type AnimatedThumbnailErrorBoundaryProps = {
  children: ReactNode;
  resetKey: number;
  onError: () => void;
};

type AnimatedThumbnailErrorBoundaryState = {
  hasError: boolean;
};

class AnimatedThumbnailErrorBoundary extends Component<
  AnimatedThumbnailErrorBoundaryProps,
  AnimatedThumbnailErrorBoundaryState
> {
  state: AnimatedThumbnailErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): AnimatedThumbnailErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.warn("Avatar animation hover preview failed", error, errorInfo);
    const { onError } = this.props;
    onError();
  }

  componentDidUpdate(prevProps: AnimatedThumbnailErrorBoundaryProps): void {
    const { resetKey } = this.props;
    const { hasError } = this.state;
    if (prevProps.resetKey !== resetKey && hasError) {
      this.setState({ hasError: false });
    }
  }

  render(): ReactNode {
    const { children } = this.props;
    const { hasError } = this.state;
    return hasError ? null : children;
  }
}

const getAnimatedThumbnailComponent = (): AnimatedThumbnailComponent | undefined => {
  if (browserWindow == null) {
    return undefined;
  }
  const external = (
    browserWindow as Window & {
      RobloxThumbnail3d?: { AnimatedThumbnail?: AnimatedThumbnailComponent };
    }
  ).RobloxThumbnail3d;
  return typeof external?.AnimatedThumbnail === "function" ? external.AnimatedThumbnail : undefined;
};

/**
 * Preserves the normal 2D thumbnail until hover/focus, then crossfades to the
 * animated thumbnailer when its legacy runtime external is available.
 */
function AnimatedAssetThumbnail({
  children,
  isPlaying,
  targetId,
  previewKey,
}: AnimatedAssetThumbnailProps): JSX.Element {
  const [isPreviewMounted, setIsPreviewMounted] = useState(false);
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const [previewFailed, setPreviewFailed] = useState(false);
  const [AnimatedThumbnail, setAnimatedThumbnail] = useState(getAnimatedThumbnailComponent);
  const canPlay = isPlaying && !previewFailed && AnimatedThumbnail !== undefined;
  const hideStaticThumbnail = isPreviewVisible && !previewFailed && isPreviewMounted;

  const getThumbnailJson = useCallback(
    () => getAnimationThumbnailMetaRequest(targetId),
    [targetId],
  );

  const onPreviewError = useCallback(() => {
    setPreviewFailed(true);
    setIsPreviewVisible(false);
  }, []);

  // Thumbnails3d can finish loading after first paint; poll only while hover wants preview.
  useEffect(() => {
    const win = browserWindow;
    if (win == null || !isPlaying || AnimatedThumbnail !== undefined) {
      return undefined;
    }
    let attempts = 0;
    const interval = win.setInterval(() => {
      attempts += 1;
      const next = getAnimatedThumbnailComponent();
      if (next !== undefined) {
        setAnimatedThumbnail(() => next);
        return;
      }
      if (attempts >= ANIMATED_THUMBNAIL_EXTERNAL_POLL_ATTEMPTS) {
        win.clearInterval(interval);
      }
    }, 250);
    return () => {
      win.clearInterval(interval);
    };
  }, [isPlaying, AnimatedThumbnail]);

  useEffect(() => {
    setPreviewFailed(false);
  }, [targetId]);

  // Keep `previewFailed` while still hovered so a broken viewer does not remount in a loop.
  useEffect(() => {
    const win = browserWindow;
    if (win == null) {
      return undefined;
    }
    if (canPlay) {
      // eslint-disable-next-line @rbx/promises/prefer-query-mutation, no-void -- warm the cache while the fade-in runs; mount retries on failure
      void fetchAnimationThumbnailMeta(targetId).catch(() => undefined);
      setIsPreviewMounted(true);
      let secondFrame = 0;
      const firstFrame = win.requestAnimationFrame(() => {
        secondFrame = win.requestAnimationFrame(() => {
          setIsPreviewVisible(true);
        });
      });
      return () => {
        win.cancelAnimationFrame(firstFrame);
        win.cancelAnimationFrame(secondFrame);
      };
    }

    setIsPreviewVisible(false);
    const timeout = win.setTimeout(() => {
      setIsPreviewMounted(false);
      if (!isPlaying) {
        setPreviewFailed(false);
      }
    }, ANIMATION_PREVIEW_FADE_MS);
    return () => {
      win.clearTimeout(timeout);
    };
  }, [canPlay, isPlaying, targetId]);

  return (
    <Fragment>
      <div
        className={classNames("avatar-item-thumbnail-2d", {
          "avatar-item-thumbnail-2d-hidden": hideStaticThumbnail,
        })}
        aria-hidden={hideStaticThumbnail}
        data-animation-preview-key={previewKey}
        data-animation-preview-active={hideStaticThumbnail ? "true" : undefined}
      >
        {children}
      </div>
      {isPreviewMounted && !previewFailed && AnimatedThumbnail !== undefined && (
        <div
          className={classNames("avatar-item-animated-thumbnail", {
            "avatar-item-animated-thumbnail-visible": isPreviewVisible,
          })}
          aria-hidden
        >
          <AnimatedThumbnailErrorBoundary resetKey={targetId} onError={onPreviewError}>
            <AnimatedThumbnail
              targetId={targetId}
              getThumbnailJson={getThumbnailJson}
              onFailure={onPreviewError}
            />
          </AnimatedThumbnailErrorBoundary>
        </div>
      )}
    </Fragment>
  );
}

export default AnimatedAssetThumbnail;
