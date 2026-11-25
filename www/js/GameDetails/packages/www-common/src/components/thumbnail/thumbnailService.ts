import * as z from "zod/mini";
import environmentUrls from "@rbx/environment-urls";
import * as http from "@rbx/core-lib/http";
import { window } from "@rbx/core-lib/browser";
import { batchQuery } from "@rbx/core-lib/promise";
import { Url } from "@rbx/core-lib/url";
import type { ResolvedThumbnail, ThumbnailFormat, ThumbnailRequest, ThumbnailType } from "./types";

const DEFAULT_SIZE = "150x150";
const DEFAULT_FORMAT: ThumbnailFormat = "webp";

// Getters, not module-scope consts: parsing at import throws for importers that never fetch (e.g. under jest).
const thumbnailsUrl = () => Url.parse(environmentUrls.thumbnailsApi).getOrThrow();

// Stable per-request key used both as the batch `requestId` we send and to pick each result back out.
const requestId = (request: ThumbnailRequest): string =>
  `${request.type}:${request.targetId}:${request.size ?? DEFAULT_SIZE}:${request.format ?? DEFAULT_FORMAT}:${request.version ?? ""}:${request.headShape ?? ""}:${request.includeBackground ? "bg" : ""}:${request.includeProfileFrame ? "frame" : ""}`;

const batchResponseSchema = z.object({
  data: z.array(
    z.object({
      requestId: z.string(),
      state: z.literal(["Completed", "Pending", "Blocked", "Error", "InReview"]),
      imageUrl: z.nullish(z.string()),
    }),
  ),
});

type ThumbnailBatchResponse = z.infer<typeof batchResponseSchema>;

const parseBatchResponse = (
  response: ThumbnailBatchResponse,
  transportRetries: number,
): Map<string, ResolvedThumbnail> => {
  const resolved = new Map<string, ResolvedThumbnail>();
  response.data.forEach(({ requestId: id, state, imageUrl }) => {
    if (state === "Completed") {
      resolved.set(
        id,
        imageUrl != null
          ? { state, imageUrl, transportRetries }
          : { state: "Error", transportRetries },
      );
    } else {
      resolved.set(
        id,
        imageUrl != null ? { state, imageUrl, transportRetries } : { state, transportRetries },
      );
    }
  });
  return resolved;
};

const fetchThumbnailBatch = async (
  requests: readonly ThumbnailRequest[],
): Promise<Map<string, ResolvedThumbnail>> => {
  const url = thumbnailsUrl().withPath("/v1/batch");
  const body = requests.map(request => ({
    requestId: requestId(request),
    type: request.type,
    targetId: request.targetId,
    size: request.size ?? DEFAULT_SIZE,
    format: request.format ?? DEFAULT_FORMAT,
    // Only send when set.
    ...(request.version != null ? { version: request.version } : {}),
    ...(request.headShape ? { headShape: request.headShape } : {}),
    ...(request.includeBackground ? { includeBackground: true } : {}),
    // Server supports this only for AvatarHeadShot; omit it elsewhere (matches legacy thumbnails).
    ...(request.includeProfileFrame && request.type === "AvatarHeadShot"
      ? { includeProfileFrame: true }
      : {}),
  }));

  let transportRetries = 0;
  const result = await http.post(url, body, batchResponseSchema, {
    credentials: "include",
    headers: { Accept: "application/json" },
    // Retry transient/retryable transport failures (needs the retryInterceptor installed).
    retry: (failedRetries, error) => {
      const delay = http.defaultBrowserRetryDelay(failedRetries, error);
      if (!Number.isNaN(delay)) {
        transportRetries += 1;
      }
      return delay;
    },
  });

  return parseBatchResponse(result.getOrThrow(), transportRetries);
};

const resolveBatched = batchQuery(
  { delay: 50, maxSize: 100 },
  fetchThumbnailBatch,
  (resolved, request: ThumbnailRequest): ResolvedThumbnail =>
    resolved.get(requestId(request)) ?? { state: "Error" },
);

const WEBP_SUPPORT_DATA_URI =
  "data:image/webp;base64,UklGRkoAAABXRUJQVlA4WAoAAAAQAAAAAAAAAAAAQUxQSAwAAAARBxAR/Q9ERP8DAABWUDggGAAAABQBAJ0BKgEAAQAAAP4AAA3AAP7mtQAAAA==";

let isWebpSupported: Promise<boolean> | undefined;

// macOS 10.x Safari can't decode webp.
const checkWebpSupport = (): Promise<boolean> => {
  isWebpSupported ??= new Promise(resolve => {
    if (window === undefined) {
      resolve(true);
      return;
    }
    const img = new window.Image();
    img.onload = () => {
      resolve(img.width > 0 && img.height > 0);
    };
    img.onerror = () => {
      resolve(false);
    };
    img.src = WEBP_SUPPORT_DATA_URI;
  });
  return isWebpSupported;
};

const webpOnlyTypes: ReadonlySet<ThumbnailType> = new Set(["GameIcon", "GameThumbnail"]);

const resolveFormat = async ({ type, format }: ThumbnailRequest): Promise<ThumbnailFormat> => {
  const requested = webpOnlyTypes.has(type) ? "webp" : (format ?? DEFAULT_FORMAT);
  if (requested !== "webp") {
    return requested;
  }
  return (await checkWebpSupport()) ? "webp" : "png";
};

export const resolveThumbnail = async (request: ThumbnailRequest): Promise<ResolvedThumbnail> =>
  resolveBatched({ ...request, format: await resolveFormat(request) });
