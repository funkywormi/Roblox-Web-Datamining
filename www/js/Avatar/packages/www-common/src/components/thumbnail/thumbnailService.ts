import * as z from "zod/mini";
import environmentUrls from "@rbx/environment-urls";
import * as http from "@rbx/core-lib/http";
import { batchQuery } from "@rbx/core-lib/promise";
import { Url } from "@rbx/core-lib/url";
import type { ResolvedThumbnail, ThumbnailRequest } from "./types";

const DEFAULT_SIZE = "150x150";
const DEFAULT_FORMAT = "webp";

const thumbnailsUrl = Url.parse(environmentUrls.thumbnailsApi).getOrThrow();

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

const parseBatchResponse = (response: ThumbnailBatchResponse): Map<string, ResolvedThumbnail> => {
  const resolved = new Map<string, ResolvedThumbnail>();
  response.data.forEach(({ requestId: id, state, imageUrl }) => {
    if (state === "Completed") {
      resolved.set(id, imageUrl != null ? { state, imageUrl } : { state: "Error" });
    } else {
      resolved.set(id, { state });
    }
  });
  return resolved;
};

const fetchThumbnailBatch = async (
  requests: readonly ThumbnailRequest[],
): Promise<Map<string, ResolvedThumbnail>> => {
  const url = thumbnailsUrl.withPath("/v1/batch");
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

  const result = await http.post(url, body, batchResponseSchema, {
    credentials: "include",
    headers: { Accept: "application/json" },
    // Retry transient/retryable transport failures (needs the retryInterceptor installed).
    retry: http.defaultBrowserRetryDelay,
  });

  return parseBatchResponse(result.getOrThrow());
};

export const resolveThumbnail = batchQuery(
  { delay: 50, maxSize: 100 },
  fetchThumbnailBatch,
  (resolved, request: ThumbnailRequest): ResolvedThumbnail =>
    resolved.get(requestId(request)) ?? { state: "Error" },
);
