import {
  Component,
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ErrorInfo,
  type JSX,
  type ReactNode,
} from "react";
import {
  DefaultThumbnailSize,
  Thumbnail2d,
  ThumbnailAssetsSize,
  ThumbnailTypes,
} from "roblox-thumbnails";
import { ItemCardUtils } from "react-style-guide";
import { window as browserWindow } from "@rbx/core-lib/browser";
import {
  ANIMATED_THUMBNAIL_EXTERNAL_POLL_ATTEMPTS,
  ANIMATION_PACK_CYCLE_FALLBACK_MS,
  ANIMATION_PREVIEW_FADE_MS,
  canAdvancePackAnimation,
  getAnimationIconClass,
  getNextPackIndexAfterFailure,
  resolveAnimationAssetType,
  type TAnimationPreviewEntry,
} from "../../../utils/animationItemUtils";
import {
  getAnimationThumbnailMetaRequest,
  prefetchAnimationThumbnailMetas,
} from "../../../utils/animationPreviewCache";

type CatalogItemCardThumbnailProps = {
  itemId: number;
  itemType: string;
  playAnimation: boolean;
  animationEntries?: TAnimationPreviewEntry[];
  enableCatalogRevampExperiment?: boolean;
  /** Used for sticky-hover detection when IXP/entries settle under the cursor. */
  previewKey?: string;
};

type AnimatedThumbnailProps = {
  targetId: number;
  getThumbnailJson?: () => Promise<{ data: unknown }>;
  onAnimationLoopFinish?: (numOfLoops: number) => void;
  onFailure?: () => void;
  onSuccess?: () => void;
};

type AnimatedThumbnailComponent = (props: AnimatedThumbnailProps) => JSX.Element;

type AnimatedPreviewErrorBoundaryProps = {
  children: ReactNode;
  resetKey: string | number;
  onError: () => void;
};

type AnimatedPreviewErrorBoundaryState = {
  hasError: boolean;
};

/** Keeps a WebGL / external failure from unmounting the whole catalog card. */
class AnimatedPreviewErrorBoundary extends Component<
  AnimatedPreviewErrorBoundaryProps,
  AnimatedPreviewErrorBoundaryState
> {
  // eslint-disable-next-line react/state-in-constructor -- matches catalog ErrorBoundary style
  state: AnimatedPreviewErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): AnimatedPreviewErrorBoundaryState {
    return { hasError: true };
  }

  // eslint-disable-next-line class-methods-use-this, @typescript-eslint/class-methods-use-this -- ErrorBoundary API
  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.warn("Catalog animation hover preview failed", error, errorInfo);
    const { onError } = this.props;
    onError();
  }

  componentDidUpdate(prevProps: AnimatedPreviewErrorBoundaryProps): void {
    const { resetKey } = this.props;
    const { hasError } = this.state;
    if (prevProps.resetKey !== resetKey && hasError) {
      this.setState({ hasError: false });
    }
  }

  render(): ReactNode {
    const { children } = this.props;
    const { hasError } = this.state;
    if (hasError) {
      return null;
    }
    return children;
  }
}

function getAnimatedThumbnailComponent(): AnimatedThumbnailComponent | undefined {
  if (browserWindow == null) {
    return undefined;
  }
  const external = (
    browserWindow as Window & {
      RobloxThumbnail3d?: {
        AnimatedThumbnail?: AnimatedThumbnailComponent;
      };
    }
  ).RobloxThumbnail3d;
  const component = external?.AnimatedThumbnail;
  return typeof component === "function" ? component : undefined;
}

/**
 * Catalog card thumbnail: 2D by default, crossfades into the 3D animated thumbnailer while
 * hovered for animation assets / animation bundles.
 *
 * Perf notes:
 * - Pack cycling changes `targetId` without remounting (no React `key` churn).
 * - Meta responses are cached / prefetched so target switches skip the first network hop.
 * - Pack advance prefers `onAnimationLoopFinish`; a watchdog covers missing loop callbacks.
 * - A failed pack member advances to the next entry; `previewFailed` only after all fail.
 * - Advances are dwell-gated + load-locked so long hovers can keep looping the pack
 *   without thrashing Thumbnail3d's async WebGL loader / orphaning RAF loops.
 */
function CatalogItemCardThumbnail({
  itemId,
  itemType,
  playAnimation,
  animationEntries = [],
  enableCatalogRevampExperiment,
  previewKey,
}: CatalogItemCardThumbnailProps): JSX.Element {
  const [animationIndex, setAnimationIndex] = useState(0);
  const [isPreviewMounted, setIsPreviewMounted] = useState(false);
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const [previewFailed, setPreviewFailed] = useState(false);
  const [AnimatedThumbnail, setAnimatedThumbnail] = useState(getAnimatedThumbnailComponent);
  // Loop-finish is the primary pack driver; this timestamp backs dwell + watchdog gating.
  const lastPackAdvanceAtRef = useRef(0);
  const failedEntryIdsRef = useRef<Set<number>>(new Set());
  // Thumbnail3d loads WebGL asynchronously; block advances until onSuccess/onFailure.
  const isPackLoadSettledRef = useRef(true);

  const thumbnailType = ItemCardUtils.checkIfBundle(itemType)
    ? ThumbnailTypes.bundleThumbnail
    : ThumbnailTypes.assetThumbnail;
  const size = enableCatalogRevampExperiment ? ThumbnailAssetsSize.size420 : DefaultThumbnailSize;
  const canPlay =
    playAnimation &&
    !previewFailed &&
    AnimatedThumbnail !== undefined &&
    animationEntries.length > 0;
  const entryIdsKey = useMemo(
    () => animationEntries.map(entry => entry.id).join(","),
    [animationEntries],
  );
  const safeIndex = animationEntries.length > 0 ? animationIndex % animationEntries.length : 0;
  const currentEntry = isPreviewMounted ? animationEntries[safeIndex] : undefined;
  const previewTargetId = currentEntry?.id;
  const iconClass = getAnimationIconClass(
    currentEntry ? resolveAnimationAssetType(currentEntry) : undefined,
  );
  // Hide 2D only while a healthy 3D preview is actually showing.
  const hideStaticThumbnail = isPreviewVisible && !previewFailed && isPreviewMounted;

  const markPackLoadSettled = useCallback(() => {
    isPackLoadSettledRef.current = true;
  }, []);

  const advancePackAnimation = useCallback(() => {
    const now = Date.now();
    if (
      !canAdvancePackAnimation({
        entryCount: animationEntries.length,
        lastAdvanceAtMs: lastPackAdvanceAtRef.current,
        nowMs: now,
        isLoadSettled: isPackLoadSettledRef.current,
      })
    ) {
      return;
    }
    lastPackAdvanceAtRef.current = now;
    isPackLoadSettledRef.current = false;
    setPreviewFailed(false);
    setAnimationIndex(previous => (previous + 1) % animationEntries.length);
  }, [animationEntries.length]);

  const getThumbnailJson = useCallback(() => {
    if (previewTargetId === undefined) {
      return Promise.reject(new Error("Missing animation preview target"));
    }
    return getAnimationThumbnailMetaRequest(previewTargetId);
  }, [previewTargetId]);

  const onPreviewError = useCallback(() => {
    // Load settled (failed); skip dwell so a broken member does not sit for 4s, but
    // re-lock until the next load settles.
    isPackLoadSettledRef.current = true;
    if (previewTargetId !== undefined) {
      failedEntryIdsRef.current.add(previewTargetId);
    }
    const nextIndex = getNextPackIndexAfterFailure(
      safeIndex,
      animationEntries,
      failedEntryIdsRef.current,
    );
    if (nextIndex === undefined || animationEntries.length <= 1) {
      setPreviewFailed(true);
      setIsPreviewVisible(false);
      return;
    }
    lastPackAdvanceAtRef.current = Date.now();
    isPackLoadSettledRef.current = false;
    setPreviewFailed(false);
    setAnimationIndex(nextIndex);
  }, [animationEntries, previewTargetId, safeIndex]);

  // Thumbnails3d can finish loading after first paint; poll only while hover wants preview.
  useEffect(() => {
    const win = browserWindow;
    if (win == null || !playAnimation || AnimatedThumbnail !== undefined) {
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
  }, [playAnimation, AnimatedThumbnail]);

  useEffect(() => {
    setAnimationIndex(0);
    setPreviewFailed(false);
    failedEntryIdsRef.current = new Set();
    isPackLoadSettledRef.current = true;
  }, [entryIdsKey]);

  // Prefetch every pack member as soon as the preview mounts.
  useEffect(() => {
    if (!isPreviewMounted || entryIdsKey.length === 0) {
      return;
    }
    prefetchAnimationThumbnailMetas(entryIdsKey.split(",").map(id => Number(id)));
  }, [isPreviewMounted, entryIdsKey]);

  // Mount → fade in on hover; fade out → unmount on leave / failure.
  // Keep `previewFailed` while still hovered so a broken viewer does not remount in a loop.
  useEffect(() => {
    const win = browserWindow;
    if (win == null) {
      return undefined;
    }
    if (canPlay) {
      lastPackAdvanceAtRef.current = Date.now();
      isPackLoadSettledRef.current = false;
      setIsPreviewMounted(true);
      let raf2 = 0;
      const raf1 = win.requestAnimationFrame(() => {
        raf2 = win.requestAnimationFrame(() => {
          setIsPreviewVisible(true);
        });
      });
      return () => {
        win.cancelAnimationFrame(raf1);
        win.cancelAnimationFrame(raf2);
      };
    }

    setIsPreviewVisible(false);
    const timeout = win.setTimeout(() => {
      setIsPreviewMounted(false);
      if (!playAnimation) {
        setAnimationIndex(0);
        setPreviewFailed(false);
        failedEntryIdsRef.current = new Set();
        isPackLoadSettledRef.current = true;
      }
    }, ANIMATION_PREVIEW_FADE_MS);
    return () => {
      win.clearTimeout(timeout);
    };
  }, [canPlay, playAnimation]);

  // Watchdog: advance when loop-finish is missing / quiet, still subject to dwell + load lock.
  useEffect(() => {
    const win = browserWindow;
    if (win == null || !canPlay || !isPreviewVisible || animationEntries.length <= 1) {
      return undefined;
    }
    const timer = win.setInterval(() => {
      advancePackAnimation();
    }, ANIMATION_PACK_CYCLE_FALLBACK_MS);
    return () => {
      win.clearInterval(timer);
    };
  }, [canPlay, isPreviewVisible, animationEntries.length, advancePackAnimation]);

  return (
    <Fragment>
      <div
        className={
          hideStaticThumbnail
            ? "catalog-item-card-thumbnail-2d catalog-item-card-thumbnail-2d-hidden"
            : "catalog-item-card-thumbnail-2d"
        }
        aria-hidden={hideStaticThumbnail}
        data-animation-preview-key={previewKey}
        data-animation-preview-active={hideStaticThumbnail ? "true" : undefined}
      >
        <Thumbnail2d type={thumbnailType} targetId={itemId} size={size} />
      </div>
      {isPreviewMounted &&
        !previewFailed &&
        AnimatedThumbnail !== undefined &&
        previewTargetId !== undefined && (
          <Fragment>
            <div
              className={
                isPreviewVisible
                  ? "catalog-item-card-animated-thumbnail catalog-item-card-animated-thumbnail-visible"
                  : "catalog-item-card-animated-thumbnail"
              }
            >
              <AnimatedPreviewErrorBoundary resetKey={previewTargetId} onError={onPreviewError}>
                <AnimatedThumbnail
                  targetId={previewTargetId}
                  getThumbnailJson={getThumbnailJson}
                  onAnimationLoopFinish={advancePackAnimation}
                  onSuccess={markPackLoadSettled}
                  onFailure={onPreviewError}
                />
              </AnimatedPreviewErrorBoundary>
            </div>
            {animationEntries.length > 1 && (
              <div
                className={
                  isPreviewVisible
                    ? "catalog-item-card-animation-type-icon catalog-item-card-animation-type-icon-visible"
                    : "catalog-item-card-animation-type-icon"
                }
                aria-hidden
              >
                <div className={`animation-icon ${iconClass}`} />
              </div>
            )}
          </Fragment>
        )}
    </Fragment>
  );
}

export default CatalogItemCardThumbnail;
