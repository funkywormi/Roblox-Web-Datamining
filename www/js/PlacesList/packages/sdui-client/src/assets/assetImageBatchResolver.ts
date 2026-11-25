import environmentUrls from "@rbx/environment-urls";
import * as http from "@rbx/core-lib/http";
import { batchQuery } from "@rbx/core-lib/promise";
import { Url } from "@rbx/core-lib/url";

type AssetLocationMap = Map<string, string | null>;

function createEmptyAssetLocationMap(assetIds: string[]): AssetLocationMap {
  return new Map(assetIds.map(assetId => [assetId, null]));
}

function parseAssetDeliveryBatchResponse(value: unknown, assetIds: string[]): AssetLocationMap {
  const resolvedUrls = createEmptyAssetLocationMap(assetIds);
  if (!Array.isArray(value)) {
    return resolvedUrls;
  }

  const responseItems: unknown[] = value;
  responseItems.forEach((responseItem, index) => {
    const fallbackAssetId = assetIds[index];
    if (fallbackAssetId == null) return;

    if (typeof responseItem !== "object" || responseItem == null) return;

    const { requestId, location } = responseItem as Partial<
      Record<"requestId" | "location", unknown>
    >;

    resolvedUrls.set(
      typeof requestId === "string" ? requestId : fallbackAssetId,
      typeof location === "string" ? location : null,
    );
  });

  return resolvedUrls;
}

function buildAssetRequestItems(assetIds: string[]) {
  return assetIds.map(assetId => ({
    assetId: Number(assetId),
    requestId: assetId,
  }));
}

async function fetchAssetImageUrlBatch(assetIds: string[]): Promise<AssetLocationMap> {
  const url = Url.parse(`${environmentUrls.assetDeliveryApi}/v1/assets/batch`).getOrThrow();
  try {
    const result = await http.postUntyped(url, buildAssetRequestItems(assetIds), {
      credentials: "include",
      headers: {
        Accept: "application/json",
        "Roblox-Browser-Asset-Request": "true",
        "Roblox-Place-Id": "0",
      },
    });

    if (result.isErr()) {
      return createEmptyAssetLocationMap(assetIds);
    }

    return parseAssetDeliveryBatchResponse(result.value, assetIds);
  } catch {
    return createEmptyAssetLocationMap(assetIds);
  }
}

export const resolveAssetImageUrl = batchQuery(
  { delay: 0, maxSize: 100 },
  fetchAssetImageUrlBatch,
  (resolvedUrls, assetId: string) => resolvedUrls.get(assetId) ?? null,
);

export function resolveSingleAssetImageUrl(assetId: string): Promise<string> {
  return Promise.resolve(
    `${environmentUrls.assetDeliveryApi}/v1/asset?id=${encodeURIComponent(assetId)}`,
  );
}

export async function resolveAssetImageUrls(assetIds: string[]): Promise<AssetLocationMap> {
  return new Map(
    await Promise.all(
      assetIds.map(async assetId => [assetId, await resolveAssetImageUrl(assetId)] as const),
    ),
  );
}
