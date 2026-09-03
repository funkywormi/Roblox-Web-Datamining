import environmentUrls from "@rbx/environment-urls";
import * as http from "@rbx/core-scripts/http";

const wrapperResolutionCache = new Map<number, Promise<number | null>>();

/**
 * `assetdelivery/v1/asset` URL for an image id, or null if env URL is unset.
 * Used for CSS `background-image` URLs (browser subresource load, not fetch).
 */
export const buildAssetDeliveryUrl = (imageAssetId: number): string | null => {
  if (!environmentUrls.assetDeliveryApi) return null;
  return `${environmentUrls.assetDeliveryApi}/v1/asset/?id=${imageAssetId}`;
};

type AssetDeliveryLocationResponse = {
  locations?: { location?: string }[];
};

/** Resolves wrapper rbxmx bytes via v2 metadata + anonymous CDN GET. */
const fetchWrapperRbxmxText = async (wrapperAssetId: number): Promise<string | null> => {
  if (!environmentUrls.assetDeliveryApi) return null;

  const metadataUrl = `${environmentUrls.assetDeliveryApi}/v2/assetId/${wrapperAssetId}`;
  // v2 stays on assetdelivery (JSON, credentialed CORS) — avoids v1's 302 to CDN.
  const metadataResponse = await http.get<AssetDeliveryLocationResponse>({
    url: metadataUrl,
    withCredentials: true,
  });
  const cdnUrl = metadataResponse.data.locations?.[0]?.location;
  if (!cdnUrl) return null;

  // contentdelivery uses wildcard ACAO; credentialed requests are blocked there.
  const rbxmxResponse = await http.get<string>({
    url: cdnUrl,
    withCredentials: false,
    responseType: "text",
  });
  return rbxmxResponse.data;
};

/**
 * Parses an AvatarBackground wrapper rbxmx → image asset id (null if absent).
 * Schema: an <Item class="IntValue"> whose <string name="Name"> is "ImageId"
 * and whose Value holds the image asset id. (Nested in a Folder named
 * "AvatarBackground", alongside a Color3Value "Color".) IntValue serializes
 * its 64-bit Value as <int64 name="Value">; <int name="Value"> is accepted as
 * a fallback for smaller ids.
 *
 * Example wrapper rbxmx:
 *   <roblox version="4">
 *     <Item class="Folder">
 *       <Properties><string name="Name">AvatarBackground</string></Properties>
 *       <Item class="IntValue">
 *         <Properties>
 *           <string name="Name">ImageId</string>
 *           <int64 name="Value">102297650938781</int64>
 *         </Properties>
 *       </Item>
 *     </Item>
 *   </roblox>
 */
export const parseWrapperRbxmx = (xmlText: string | null | undefined): number | null => {
  // Null on empty/whitespace/missing rbxmx (e.g. failed or empty wrapper fetch).
  if (!xmlText?.trim()) return null;

  const doc = new DOMParser().parseFromString(xmlText, "application/xml");
  if (doc.getElementsByTagName("parsererror").length > 0) return null;

  const imageIdItem = [...doc.querySelectorAll('Item[class="IntValue"]')].find(
    item =>
      item.querySelector('Properties > string[name="Name"]')?.textContent.trim() === "ImageId",
  );
  const rawValue = imageIdItem
    ?.querySelector('Properties > int64[name="Value"], Properties > int[name="Value"]')
    ?.textContent.trim();

  const id = Number(rawValue);
  return id > 0 && Number.isFinite(id) ? id : null;
};

/** Clears resolver promise cache (tests). */
export const clearAvatarBackgroundWrapperCache = (): void => {
  wrapperResolutionCache.clear();
};

export const resolveAvatarBackgroundWrapper = (wrapperAssetId: number): Promise<number | null> => {
  const cached = wrapperResolutionCache.get(wrapperAssetId);
  if (cached) return cached;

  const pending = (async (): Promise<number | null> => {
    try {
      const text = await fetchWrapperRbxmxText(wrapperAssetId);
      return parseWrapperRbxmx(text);
    } catch {
      return null;
    }
  })();

  wrapperResolutionCache.set(wrapperAssetId, pending);
  return pending;
};
