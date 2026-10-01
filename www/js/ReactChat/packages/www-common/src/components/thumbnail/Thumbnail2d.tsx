import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@rbx/foundation-ui";
import { resolveThumbnail } from "./thumbnailService";
import { logMeasurement } from "./thumbnailMeasurement";
import type { ResolvedThumbnail, ThumbnailFormat, ThumbnailType } from "./types";
import "./thumbnailContainer.css";
import "./thumbnailStatus.css";

const MAX_PENDING_POLLS = 5;

// useQuery only registers a failure on a throw, so a still-generating thumbnail throws this to drive
// retry (the poll) — not a real error.
const PENDING = new Error("thumbnail pending");

// Status placeholder class (styled by thumbnailStatus.css); "" when the image is ready or loading.
const statusClass = (data: ResolvedThumbnail | undefined, isError: boolean, error: unknown) => {
  if (data?.state === "Blocked") return "icon-blocked";
  if (data?.state === "InReview") return "icon-in-review";
  if (data?.state === "Error") return "icon-broken";
  if (isError) return error === PENDING ? "icon-pending" : "icon-broken";
  return "";
};

export type Thumbnail2dProps = {
  targetId: number | string;
  type: ThumbnailType;
  size?: string;
  format?: ThumbnailFormat;
  version?: number | string;
  headShape?: string;
  includeBackground?: boolean;
  /** AvatarHeadShot only — server composites the user's profile frame into the image. */
  includeProfileFrame?: boolean;
  altName?: string;
  imgClassName?: string;
  containerClassName?: string;
};

// Renders a 2D asset/bundle thumbnail from the thumbnails `/v1/batch` endpoint. A `QueryClientProvider` ancestor is required.
const Thumbnail2d = ({
  targetId,
  type,
  size,
  format,
  version,
  headShape,
  includeBackground,
  includeProfileFrame,
  altName = "",
  imgClassName = "",
  containerClassName = "",
}: Thumbnail2dProps) => {
  // Per-request timing/poll tracking for the load metrics fired below.
  const startRef = useRef(Date.now());
  const pollCountRef = useRef(0);
  const loggedRef = useRef(false);

  const { data, isError, error, isPending, isLoading } = useQuery({
    queryKey: [
      "thumbnail-2d",
      type,
      targetId,
      size,
      format,
      version,
      headShape,
      includeBackground,
      includeProfileFrame,
    ],
    // Only the Pending poll retries here; transient transport failures are retried in http.post.
    retry: (failureCount, err) => err === PENDING && failureCount < MAX_PENDING_POLLS,
    queryFn: async (): Promise<ResolvedThumbnail> => {
      const resolved = await resolveThumbnail({
        type,
        targetId,
        size,
        format,
        version,
        headShape,
        includeBackground,
        includeProfileFrame,
      });
      if (resolved.state === "Pending") {
        pollCountRef.current += 1;
        // eslint-disable-next-line no-restricted-syntax -- useQuery signals "retry" only via a throw
        throw PENDING;
      }
      return resolved;
    },
  });

  // Reset per-request tracking when the thumbnail identity changes.
  useEffect(() => {
    startRef.current = Date.now();
    pollCountRef.current = 0;
    loggedRef.current = false;
  }, [type, targetId, size, format, version, headShape, includeBackground, includeProfileFrame]);

  // Fire load measurements once per resolution (react-query v5 has no onSuccess/onError callback).
  useEffect(() => {
    if (loggedRef.current) {
      return;
    }
    const thumbnailType = `${type}_2d`;
    if (data) {
      loggedRef.current = true;
      logMeasurement("ThumbnailStatusCountWebapp", {
        Status: data.state,
        ThumbnailType: thumbnailType,
      });
      if (data.state === "Completed") {
        const retries = pollCountRef.current;
        logMeasurement("ThumbnailLoadDurationWebapp", {
          Status: "Success",
          ThumbnailType: thumbnailType,
          Value: String(Date.now() - startRef.current),
        });
        logMeasurement(
          retries === 0 ? "ThumbnailNoRetrySuccessWebapp" : "ThumbnailRetryWebapp",
          retries === 0
            ? { ThumbnailType: thumbnailType }
            : { ThumbnailType: thumbnailType, Value: String(retries) },
        );
      }
    } else if (isError && error === PENDING) {
      loggedRef.current = true;
      logMeasurement("ThumbnailTimeoutWebapp", { ThumbnailType: thumbnailType });
    }
  }, [data, isError, error, type]);

  const imageUrl = data?.state === "Completed" ? data.imageUrl : null;
  const stateClass = statusClass(data, isError, error);
  // isPending is react-query v5; v4 exposes the same state as isLoading. The v5 dev types don't
  // express that isPending is undefined under a v4 host, so the nullish check reads as unnecessary.
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- undefined on react-query v4
  const showSkeleton = isPending ?? isLoading;

  const wrapperClass = [
    "thumbnail-2d-container float-left overflow-hidden",
    containerClassName,
    stateClass,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <span className={wrapperClass}>
      {showSkeleton && <Skeleton variant="Rectangle" width="100%" height="100%" />}
      {imageUrl != null && (
        <img
          className={["size-full", imgClassName].filter(Boolean).join(" ")}
          src={imageUrl}
          alt={altName}
        />
      )}
    </span>
  );
};

export default Thumbnail2d;
