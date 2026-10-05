import { signal, batch, type ReadonlySignal, type Signal } from "@preact/signals-core";
import { shallowValueEqual } from "../../../signals/computedEqual";
import { DataStatus } from "../../../types";

/** Reactive handle returned by `DataCache.getItem(s)`. Use `.value` to subscribe, `.peek()` for non-tracking reads. */
export interface DataCacheItem<T> {
  data: ReadonlySignal<T | undefined>;
  status: ReadonlySignal<DataStatus>;
}

export interface DataCacheOptions {
  /** Successful-write TTL. Default `Infinity`. */
  ttlMs?: number;
  /** Failed-write TTL. Default 60_000. */
  failedTtlMs?: number;
  /** Monotonic ms clock. Default `performance.now`; injectable for tests. */
  now?: () => number;
}

export interface DataCache<T> {
  /**
   * Reactive read. `needsRefresh` is true when the entry was never written,
   * has expired, is `Failed` past its failed-TTL, or `shouldRefresh` returned
   * true. Always allocates the signal so the caller subscribes to future writes.
   */
  getItem(
    id: string,
    shouldRefresh?: (value: T | undefined) => boolean,
  ): { item: DataCacheItem<T>; needsRefresh: boolean };

  getItems(
    ids: string[],
    shouldRefresh?: (value: T | undefined) => boolean,
  ): { items: Map<string, DataCacheItem<T>>; needsRefresh: Map<string, boolean> };

  /** Shallow-merge with the existing entry when both are plain objects, else replace. Sets status to `Ready`. */
  updateItem(id: string, value: T): void;
  updateItems(values: Record<string, T>): void;
  /** Replace outright (no merge). Sets status to `Ready`. */
  replaceItem(id: string, value: T): void;
  replaceItems(values: Record<string, T>): void;
  /** Set status to `Failed` and start the failed-TTL window; data signal untouched. */
  markItemsAsFailed(ids: string[]): void;
  /** Flip `Failed` -> `NotReady`; no effect on other statuses. */
  resetFailedItem(id: string): void;
  resetFailedItems(ids: string[]): void;
  /** Non-reactive snapshot of every `Ready` entry. */
  snapshot(): Map<string, T>;
  /**
   * Drop all entries and bump `generation` so in-flight fetches resolving
   * later are ignored. Live readers see `undefined` / `NotReady` until next write.
   */
  clear(): void;
  dispose(): void;
  /**
   * Bumped by `clear()`. Long-running ops snapshot this before scheduling and
   * discard their result if it changed by resolution time.
   */
  readonly generation: { current: number };
}

interface CacheEntry<T> {
  data: Signal<T | undefined>;
  // Lazily allocated on first read so allocation cost tracks actual demand.
  status: Signal<DataStatus> | undefined;
}

const ONE_MINUTE_MS = 60 * 1000;

export function createDataCache<T>(options: DataCacheOptions = {}): DataCache<T> {
  const ttlMs = options.ttlMs ?? Number.POSITIVE_INFINITY;
  const failedTtlMs = options.failedTtlMs ?? ONE_MINUTE_MS;
  const now = options.now ?? (() => performance.now());

  const entries = new Map<string, CacheEntry<T>>();
  const expiresAt = new Map<string, number>();
  const generation = { current: 0 };

  function getOrCreateEntry(id: string): CacheEntry<T> {
    let entry = entries.get(id);
    if (!entry) {
      entry = { data: signal<T | undefined>(undefined), status: undefined };
      entries.set(id, entry);
    }
    return entry;
  }

  function getOrCreateStatusSignal(entry: CacheEntry<T>): Signal<DataStatus> {
    // eslint-disable-next-line no-param-reassign -- intentional lazy init on the cache record we own.
    entry.status ??= signal<DataStatus>(DataStatus.NotReady);
    return entry.status;
  }

  function readableItem(entry: CacheEntry<T>): DataCacheItem<T> {
    return {
      data: entry.data,
      status: getOrCreateStatusSignal(entry),
    };
  }

  function computeNeedsRefresh(
    id: string,
    entry: CacheEntry<T>,
    shouldRefresh: ((value: T | undefined) => boolean) | undefined,
  ): boolean {
    const expiry = expiresAt.get(id);
    if (expiry === undefined) return true;
    if (now() >= expiry) return true;

    // `peek()` so this decision doesn't subscribe; consumers already subscribed via the returned signals.
    const data = entry.data.peek();
    const status = entry.status?.peek() ?? DataStatus.NotReady;
    if (data === undefined && status !== DataStatus.Failed) return true;

    if (shouldRefresh) return shouldRefresh(data);
    return false;
  }

  function getItem(
    id: string,
    shouldRefresh?: (value: T | undefined) => boolean,
  ): { item: DataCacheItem<T>; needsRefresh: boolean } {
    const entry = getOrCreateEntry(id);
    return {
      item: readableItem(entry),
      needsRefresh: computeNeedsRefresh(id, entry, shouldRefresh),
    };
  }

  function getItems(
    ids: string[],
    shouldRefresh?: (value: T | undefined) => boolean,
  ): { items: Map<string, DataCacheItem<T>>; needsRefresh: Map<string, boolean> } {
    const items = new Map<string, DataCacheItem<T>>();
    const needsRefresh = new Map<string, boolean>();
    for (const id of ids) {
      const result = getItem(id, shouldRefresh);
      items.set(id, result.item);
      needsRefresh.set(id, result.needsRefresh);
    }
    return { items, needsRefresh };
  }

  function shallowMerge(existing: T | undefined, incoming: T): T {
    if (
      existing &&
      typeof existing === "object" &&
      !Array.isArray(existing) &&
      incoming &&
      typeof incoming === "object" &&
      !Array.isArray(incoming)
    ) {
      // Mirrors Lua's `Cryo.Dictionary.union(oldData, entry)`.
      // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- guarded by the runtime check above.
      return { ...(existing as object), ...(incoming as object) } as T;
    }
    return incoming;
  }

  function writeReady(id: string, value: T, expiry: number): void {
    const entry = getOrCreateEntry(id);
    if (!shallowValueEqual(entry.data.peek(), value)) {
      entry.data.value = value;
    }
    const statusSignal = getOrCreateStatusSignal(entry);
    if (statusSignal.peek() !== DataStatus.Ready) {
      statusSignal.value = DataStatus.Ready;
    }
    expiresAt.set(id, expiry);
  }

  function updateItem(id: string, value: T): void {
    const entry = getOrCreateEntry(id);
    const merged = shallowMerge(entry.data.peek(), value);
    writeReady(id, merged, now() + ttlMs);
  }

  function updateItems(values: Record<string, T>): void {
    const expiry = now() + ttlMs;
    batch(() => {
      for (const [id, value] of Object.entries(values)) {
        const entry = getOrCreateEntry(id);
        writeReady(id, shallowMerge(entry.data.peek(), value), expiry);
      }
    });
  }

  function replaceItem(id: string, value: T): void {
    writeReady(id, value, now() + ttlMs);
  }

  function replaceItems(values: Record<string, T>): void {
    const expiry = now() + ttlMs;
    batch(() => {
      for (const [id, value] of Object.entries(values)) {
        writeReady(id, value, expiry);
      }
    });
  }

  function markItemsAsFailed(ids: string[]): void {
    const expiry = now() + failedTtlMs;
    batch(() => {
      for (const id of ids) {
        const entry = entries.get(id);
        // Skip never-read ids so we don't materialize a status signal for them.
        if (!entry) continue;
        getOrCreateStatusSignal(entry).value = DataStatus.Failed;
        expiresAt.set(id, expiry);
      }
    });
  }

  function resetFailedItem(id: string): void {
    const entry = entries.get(id);
    if (!entry?.status) return;
    if (entry.status.peek() === DataStatus.Failed) {
      entry.status.value = DataStatus.NotReady;
    }
  }

  function resetFailedItems(ids: string[]): void {
    batch(() => {
      for (const id of ids) resetFailedItem(id);
    });
  }

  function snapshot(): Map<string, T> {
    const result = new Map<string, T>();
    for (const [id, entry] of entries) {
      const value = entry.data.peek();
      const status = entry.status?.peek() ?? DataStatus.NotReady;
      if (value !== undefined && status === DataStatus.Ready) {
        result.set(id, value);
      }
    }
    return result;
  }

  function clear(): void {
    generation.current += 1;
    expiresAt.clear();
    // Wake live readers (existing `computed`s still hold these signals) before
    // dropping the entries map.
    batch(() => {
      for (const entry of entries.values()) {
        if (entry.data.peek() !== undefined) entry.data.value = undefined;
        if (entry.status && entry.status.peek() !== DataStatus.NotReady) {
          entry.status.value = DataStatus.NotReady;
        }
      }
    });
    entries.clear();
  }

  function dispose(): void {
    clear();
  }

  return {
    getItem,
    getItems,
    updateItem,
    updateItems,
    replaceItem,
    replaceItems,
    markItemsAsFailed,
    resetFailedItem,
    resetFailedItems,
    snapshot,
    clear,
    dispose,
    generation,
  };
}
