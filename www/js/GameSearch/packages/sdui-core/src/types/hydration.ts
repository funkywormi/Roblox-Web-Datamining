import { HydrationContentType } from "@rbx/service-contracts-proto/roblox/apppageplatform/shared/v1beta1/hydration_content_type_pb.js";

// ─── Hydration Data ───

export type EntityData = Record<string, unknown>;
export type HydrationStoreMap = Map<HydrationContentType | string, Map<string, EntityData>>;

export type HydrationContent = Record<string, Record<string, EntityData>>;

/**
 * Per-id liveness status of a `DataCache` entry. Mirrors the Lua
 * `DataStatus` from
 * `lua-apps/modules/app-common/data-hydration/src/DataHydrationTypes.lua`
 * so feature stores ported from Lua can reuse the same mental model.
 *
 * - `NotReady` — never written, or `clear()`/`resetFailedItem()` reset it.
 * - `Ready`    — `updateItem*` / `replaceItem*` populated it successfully.
 * - `Failed`   — `markItemsAsFailed()` recorded a fetch failure; the cache
 *                will return the most recent value (if any) but report
 *                `Failed` until the failed-TTL elapses or another write
 *                lands.
 */
export enum DataStatus {
  NotReady = "notReady",
  Ready = "ready",
  Failed = "failed",
}

/**
 * Combined reactive read result returned by every `HydrationStore` and
 * by the `SduiDataBinder.getField`/`getEntity` / `resolveBindingPath`
 * helpers. Pairing value and status in one shape means:
 *
 * - **One cache lookup per read** instead of separate value + status calls.
 * - **One contract** for prop builders to thread through to the structured
 *   `PropSignalEntry { value, status? }` they emit.
 * - **No optional `getStatus` sidecar method** — every store reports a
 *   status, defaulting to `Ready` for stores (`UnkeyedStore`,
 *   `LocalizedLiteralsStore`) that don't track per-id loading state.
 */
export interface HydrationRead<T = unknown> {
  value: T | undefined;
  status: DataStatus;
}

/** Sentinel `HydrationRead` used when the read can't proceed (no store, etc). */
export const NOT_READY_READ: HydrationRead<never> = {
  value: undefined,
  status: DataStatus.NotReady,
};

/** Sentinel `HydrationRead` for paths that don't track per-id status. */
export const READY_UNDEFINED_READ: HydrationRead<never> = {
  value: undefined,
  status: DataStatus.Ready,
};

/**
 * Per-content-type hydration store backing the SDUI data binder.
 *
 * Each store owns its own signals and chooses its reactivity granularity
 * (per-id, per-field, or custom). The binder treats all stores uniformly.
 *
 * Reads must occur inside a reactive context (`computed`, etc.) to subscribe.
 * `getField` / `getEntity` return a `HydrationRead` (value + per-id status)
 * in a single lookup. Passive stores report `Ready` constantly; active
 * stores report `NotReady → Ready → Failed` per id.
 */
export interface HydrationStore {
  /** Reactive read of a single field. */
  getField(id: string, path: string[]): HydrationRead;

  /** Reactive read of a whole entity record. */
  getEntity(id: string): HydrationRead<EntityData>;

  /**
   * Merge an update into the store.
   * - Entity stores: `Record<id, EntityData>`, merged per id.
   * - Unkeyed stores: a single `EntityData`, diffed per field.
   */
  applyUpdate(update: EntityData | Record<string, EntityData>): void;

  /** Non-reactive snapshot for serialization / SSR handoff. */
  snapshot(): Map<string, EntityData>;

  /** Drop stored data. Live readers see `undefined` until the next write. */
  clear(): void;
}
