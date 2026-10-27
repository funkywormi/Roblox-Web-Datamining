import { window as browserWindow } from "@rbx/core-lib/browser";
import { itemDetailsConstants } from "../../itemDetails/constants/itemDetailsConstants";
import { animationConstants } from "../../itemDetailsThumbnail/constants/itemDetailsThumbnailConstants";
import type { ItemWithDetails } from "../constants/types";

/**
 * Asset type ids that AvatarAccoutrementService.isAnimation treats as animations.
 * Kept as a local set so catalog cards do not depend on the window.Roblox accoutrement
 * bundle (which is not available in every runtime that renders these cards).
 */
const ANIMATION_ASSET_TYPE_IDS = new Set([
  48, // Climb
  50, // Fall
  51, // Idle
  52, // Jump
  53, // Run
  54, // Swim
  55, // Walk
  61, // Emote
]);

/**
 * Minimum time a pack member must stay mounted before advancing. Thumbnail3d starts an
 * async WebGL load on targetId change; advancing again before that resolves can orphan
 * requestAnimationFrame loops and freeze the page after a long hover.
 * Also used as the watchdog interval for missing loop callbacks.
 */
export const ANIMATION_PACK_CYCLE_FALLBACK_MS = 4000;

/** Alias for dwell checks — same window as the watchdog. */
export const ANIMATION_PACK_MIN_DWELL_MS = ANIMATION_PACK_CYCLE_FALLBACK_MS;

/** True when the pack watchdog should advance because loop-finish has gone quiet. */
export const shouldWatchdogAdvancePack = (
  lastAdvanceAtMs: number,
  nowMs: number,
  fallbackMs: number = ANIMATION_PACK_CYCLE_FALLBACK_MS,
): boolean => nowMs - lastAdvanceAtMs >= fallbackMs;

/**
 * Whether a pack may advance to the next member. Requires dwell elapsed and the previous
 * WebGL load to have settled — packs keep looping while hovered, but never thrash
 * Thumbnail3d's async loader.
 */
export const canAdvancePackAnimation = ({
  entryCount,
  lastAdvanceAtMs,
  nowMs,
  isLoadSettled,
  minDwellMs = ANIMATION_PACK_MIN_DWELL_MS,
}: {
  entryCount: number;
  lastAdvanceAtMs: number;
  nowMs: number;
  isLoadSettled: boolean;
  minDwellMs?: number;
}): boolean => entryCount > 1 && isLoadSettled && nowMs - lastAdvanceAtMs >= minDwellMs;

/**
 * Next pack index to try after the current member fails. Returns undefined when there
 * is nowhere left to go (single entry, or every entry id is already in failedIds).
 */
export const getNextPackIndexAfterFailure = (
  currentIndex: number,
  entries: ReadonlyArray<{ id: number }>,
  failedIds: ReadonlySet<number>,
): number | undefined => {
  if (entries.length <= 1) {
    return undefined;
  }
  for (let offset = 1; offset <= entries.length; offset += 1) {
    const next = (currentIndex + offset) % entries.length;
    const entry = entries[next];
    if (entry !== undefined && !failedIds.has(entry.id)) {
      return next;
    }
  }
  return undefined;
};

/** Keep in sync with `.catalog-item-card-animated-thumbnail` opacity transition. */
export const ANIMATION_PREVIEW_FADE_MS = 280;

/** Longer than the SDUI default (100ms) so cursor sweeps across a grid don't mount WebGL. */
export const ANIMATION_HOVER_INTENT_MS = 300;

/** Stop polling for a late Thumbnails3d external after this many attempts (~10s at 250ms). */
export const ANIMATED_THUMBNAIL_EXTERNAL_POLL_ATTEMPTS = 40;

export const prefersReducedMotion = (): boolean => {
  if (browserWindow == null || typeof browserWindow.matchMedia !== "function") {
    return false;
  }
  return browserWindow.matchMedia("(prefers-reduced-motion: reduce)").matches;
};

export type TAnimationPreviewEntry = {
  id: number;
  assetType?: number;
  name?: string;
};

const isAssetType = (type: string | undefined): boolean =>
  typeof type === "string" && type.toLowerCase() === "asset";

const NAME_TO_ASSET_TYPE: Array<{ match: RegExp; assetType: number }> = [
  { match: /climb/i, assetType: 48 },
  { match: /fall/i, assetType: 50 },
  { match: /idle/i, assetType: 51 },
  { match: /jump/i, assetType: 52 },
  { match: /run/i, assetType: 53 },
  { match: /swim/i, assetType: 54 },
  { match: /walk/i, assetType: 55 },
];

/** Infer climb/walk/run/etc. from the bundled item name when assetType is missing. */
export const inferAnimationAssetTypeFromName = (name: string | undefined): number | undefined => {
  if (!name) {
    return undefined;
  }
  for (const entry of NAME_TO_ASSET_TYPE) {
    if (entry.match.test(name)) {
      return entry.assetType;
    }
  }
  return undefined;
};

export const resolveAnimationAssetType = (entry: TAnimationPreviewEntry): number | undefined =>
  entry.assetType ?? inferAnimationAssetTypeFromName(entry.name);

export const getAnimationIconClass = (assetTypeId: number | undefined): string => {
  if (assetTypeId === undefined) {
    return animationConstants.defaultAnimation;
  }
  const icons = animationConstants.animationIcons as Record<number, string>;
  return icons[assetTypeId] ?? animationConstants.defaultAnimation;
};

/**
 * Entries to play on hover. Animation packs return every bundled asset so the card can
 * cycle previews; single animation assets return themselves.
 */
export const getAnimationPreviewEntries = (item: ItemWithDetails): TAnimationPreviewEntry[] => {
  if (item.itemType === "Asset") {
    return ANIMATION_ASSET_TYPE_IDS.has(item.assetType)
      ? [{ id: item.id, assetType: item.assetType, name: item.name }]
      : [];
  }

  if (item.itemType === "Bundle" && item.bundleType === itemDetailsConstants.animationBundleType) {
    if (item.bundledItems && item.bundledItems.length > 0) {
      return item.bundledItems
        .filter(entry => isAssetType(entry.type))
        .map(entry => ({
          id: entry.id,
          assetType: entry.assetType,
          name: entry.name,
        }));
    }
    return (item.items ?? [])
      .filter(entry => isAssetType(entry.type))
      .map(entry => ({ id: entry.id }));
  }

  return [];
};

/** @deprecated Prefer getAnimationPreviewEntries; kept for simple single-id callers/tests. */
export const getAnimationPreviewTargetId = (item: ItemWithDetails): number | undefined =>
  getAnimationPreviewEntries(item)[0]?.id;

export const canPreviewAnimationOnHover = (item: ItemWithDetails): boolean =>
  getAnimationPreviewEntries(item).length > 0;

/**
 * True for animation assets / animation bundles even before pack members hydrate, so hover
 * handlers can attach early and still fire once entries arrive under the cursor.
 */
export const isAnimationItemCard = (item: ItemWithDetails): boolean => {
  if (item.itemType === "Asset") {
    return ANIMATION_ASSET_TYPE_IDS.has(item.assetType);
  }
  return item.itemType === "Bundle" && item.bundleType === itemDetailsConstants.animationBundleType;
};
