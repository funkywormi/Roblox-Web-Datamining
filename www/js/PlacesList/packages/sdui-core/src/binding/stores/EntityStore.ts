import type { EntityData, HydrationRead, HydrationStore } from "../../types";
import { tryGetPathFromData } from "../tryGetPathFromData";
import { createDataCache, type DataCache } from "./core/DataCache";

/**
 * One typed function per derived field name. Each returns that field's value.
 * `id` is the cache key the field was read under.
 */
export type DerivedFieldComputers<E, Derived extends object> = {
  [K in keyof Derived]: (entityData: E, id: string) => Derived[K];
};

export interface EntityStoreOptions<
  E extends EntityData = EntityData,
  Derived extends object = Record<never, never>,
> {
  /**
   * Seed entities by id at construction. Useful for SSR handoff and tests.
   */
  initial?: Record<string, E>;

  /**
   * Derived fields, keyed by field name. Each function's return type is
   * checked against `Derived`. Called only when the field is missing on the
   * entity, so a stored field always wins. `id` is the cache key `getField`
   * was called with.
   */
  derivedFieldComputers?: DerivedFieldComputers<E, Derived>;
}

/**
 * Entity-keyed store with one signal per id. Touching `badge:1` does not
 * wake consumers reading `badge:2`. Reactivity is per-id.
 *
 * `applyUpdate` shallow-merges into existing entities.
 *
 * Storage is delegated to an internal `DataCache<E>` so the passive
 * `EntityStore` and the active `ResolvableEntityStore` share one
 * mechanism for per-id signals, status, TTL, and snapshotting. The
 * passive default uses `ttlMs: Infinity` because data only arrives via
 * `applyUpdate` from the binder — there is nothing to expire.
 *
 * `E` (defaults to `EntityData`) lets subclasses narrow the record
 * shape so `cache`, `getEntity`, and `snapshot` are typed end-to-end.
 * `Derived` types the return value of each derived field function. It does not
 * type `getField`: a stored field of the same name is returned instead, and
 * `applyUpdate` does not check stored values against `Derived`.
 * `applyUpdate` keeps the wide `HydrationStore` parameter type so the
 * subclass still satisfies the interface; incoming records are
 * runtime-guarded before being treated as `E`.
 *
 * Lifetime depends on the runtime:
 *
 * - **Browser:** `getInstance()` returns a lazy process singleton for
 *   no-argument construction, shared across React mounts and SDUI services
 *   bundles for the tab. Passing constructor arguments returns a fresh
 *   instance so per-request dependencies are
 *   not cached process-wide.
 * - **SSR (no `window`):** `getInstance()` returns a fresh per-call
 *   instance. Instances are scoped to the calling
 *   `createSduiServices()` request and dropped with it.
 *
 * The `WeakMap` cache exists only on the browser path.
 *
 * Convention (not enforced by the compiler): production code goes through
 * `EntityStore.getInstance()` rather than `new EntityStore()`. The base
 * class itself is publicly constructible — `new EntityStore({...})` is
 * intentionally allowed so tests can spin up generic, ad-hoc entity stores
 * without having to subclass.
 */
export class EntityStore<
  E extends EntityData = EntityData,
  Derived extends object = Record<never, never>,
> implements HydrationStore
{
  // Keyed by subclass constructor; values are `unknown` so subclasses
  // with different `E` share one map. `instanceof this` below is the
  // actual type guard.
  private static readonly instances = new WeakMap<object, unknown>();

  // `<any>` is required: `EntityStore` is invariant in `E` and `Derived`, so a
  // narrowed subclass won't satisfy a fixed `this:`. `instanceof this` is
  // the real guard; `T` stays typed.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- see comment above.
  static getInstance<T extends EntityStore<any, any>, A extends unknown[]>(
    this: new (...args: A) => T,
    ...args: A
  ): T {
    if (args.some(arg => arg !== undefined) || typeof window === "undefined") {
      return new this(...args);
    }
    const cached = EntityStore.instances.get(this);
    if (cached instanceof this) return cached;
    // Args are empty/undefined on the singleton path, passing them is a no-op here.
    const instance = new this(...args);
    EntityStore.instances.set(this, instance);

    return instance;
  }

  /**
   * Test-only: drop the cached singleton for the subclass this method is
   * called on so the next `getInstance()` call constructs a fresh store.
   * Production code must never call this — there is no need to reset a
   * process-scoped store.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- see getInstance comment.
  static __resetForTesting(this: new () => EntityStore<any, any>): void {
    EntityStore.instances.delete(this);
  }

  protected readonly cache: DataCache<E>;
  private readonly derivedFieldComputers?: DerivedFieldComputers<E, Derived>;

  constructor(options: EntityStoreOptions<E, Derived> = {}) {
    this.cache = createDataCache<E>({ ttlMs: Number.POSITIVE_INFINITY });
    this.derivedFieldComputers = options.derivedFieldComputers;
    if (options.initial) {
      this.cache.replaceItems(options.initial);
    }
  }

  /**
   * Reactive read of a single field. Single `cache.getItem(id)` lookup
   * — both the value and per-id `DataStatus` come from the same item,
   * so we never pay for a second map lookup just to fetch the status.
   *
   * Status semantics: `notReady` for an id that has never been written;
   * `ready` after the first `applyUpdate`/`updateItem`/`replaceItem`;
   * `failed` only when a downstream resolver explicitly marks it
   * (passive `EntityStore` instances never flip to `failed` on their
   * own).
   */
  getField(id: string, path: readonly string[]): HydrationRead {
    const { item } = this.cache.getItem(id);
    const status = item.status.value;
    const entity = item.data.value;
    if (!entity) return { value: undefined, status };

    const value = tryGetPathFromData(entity, path);
    if (value !== undefined) return { value, status };

    // Derived-field fallback is only addressed by single-key paths (e.g. `['createdTimeFormatted']`).
    if (path.length !== 1) return { value: undefined, status };
    const headField = path[0];
    if (headField === undefined) return { value: undefined, status };
    return { value: this.readDerivedField(headField, entity, id), status };
  }

  private readDerivedField(fieldName: string, entity: E, id: string): unknown {
    const { derivedFieldComputers } = this;
    if (derivedFieldComputers && Object.hasOwn(derivedFieldComputers, fieldName)) {
      // `hasOwn` proves `fieldName` is a key of this store's `Derived`.
      // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- see comment above.
      return derivedFieldComputers[fieldName as keyof Derived](entity, id);
    }
    return undefined;
  }

  getEntity(id: string): HydrationRead<E> {
    const { item } = this.cache.getItem(id);
    return { value: item.data.value, status: item.status.value };
  }

  applyUpdate(update: EntityData | Record<string, EntityData>): void {
    // The `EntityData | Record<string, EntityData>` union is the shared
    // HydrationStore signature, kept wide for interface conformance. For
    // the entity branch each value is a record-of-records keyed by id;
    // null/non-object values are ignored defensively. Cast to `E` is
    // sound: the binder routes updates by content type, so a record
    // arriving on this store is by contract a record of `E`.
    const sanitized: Record<string, E> = {};
    let hasAnyEntry = false;
    for (const [id, entityValue] of Object.entries(update)) {
      if (entityValue === null || typeof entityValue !== "object") continue;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- runtime-checked record-of-records branch of the HydrationStore.applyUpdate union; content-type routing guarantees E shape.
      sanitized[id] = entityValue as E;
      hasAnyEntry = true;
    }
    if (hasAnyEntry) this.cache.updateItems(sanitized);
  }

  snapshot(): Map<string, E> {
    return this.cache.snapshot();
  }

  clear(): void {
    this.cache.clear();
  }
}
