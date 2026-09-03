import { RBX_THUMB_DEFAULTS } from "../consts/defaults";

export interface RbxThumbParams {
  type: string;
  targetId: number;
  size: string;
}

export type ParsedImageString =
  | {
      kind: "thumbnail";
      thumbnail: RbxThumbParams;
    }
  | {
      kind: "asset";
      assetId: string;
    };

/**
 * Parses `rbxthumb://type=Asset&id=123&w=420&h=420` into Thumbnail2d props.
 */
export function parseRbxThumb(raw: string): RbxThumbParams | null {
  if (!raw.startsWith("rbxthumb://")) return null;

  const params = new URLSearchParams(raw.slice("rbxthumb://".length));
  const type = params.get("type") ?? RBX_THUMB_DEFAULTS.type;
  const id = params.get("id");
  const width = params.get("w") ?? RBX_THUMB_DEFAULTS.width;
  const height = params.get("h") ?? RBX_THUMB_DEFAULTS.height;

  if (!id) return null;

  const targetId = Number(id);
  if (!Number.isFinite(targetId) || targetId === 0) return null;

  return { type, targetId, size: `${width}x${height}` };
}

/**
 * Parses `rbxassetid://93407147592241` into an asset id string.
 */
export function parseRbxAsset(raw: string): string | null {
  if (!raw.startsWith("rbxassetid://")) return null;

  const assetId = raw.slice("rbxassetid://".length);
  const parsedAssetId = Number(assetId);
  if (!assetId || !Number.isFinite(parsedAssetId) || parsedAssetId === 0) return null;

  return assetId;
}

/**
 * Parses supported Roblox image strings into render-ready image data.
 */
export function parseImageString(raw: string): ParsedImageString | null {
  const thumbnail = parseRbxThumb(raw);
  if (thumbnail) {
    return { kind: "thumbnail", thumbnail };
  }

  const assetId = parseRbxAsset(raw);
  if (assetId) {
    return { kind: "asset", assetId };
  }

  return null;
}
