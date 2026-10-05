import { signal, batch, type Signal } from "@preact/signals-core";
import type { EntityData, HydrationRead, HydrationStore } from "../../types";
import { DataStatus } from "../../types";
import { snakeToCamel } from "../../utils/caseConversion";
import { tryGetPathFromData } from "../tryGetPathFromData";

export interface UnkeyedStoreOptions<R extends EntityData = EntityData> {
  /**
   * Seed the record at construction. Useful for SSR handoff and tests so
   * first read returns sane defaults instead of `undefined`.
   */
  initial?: R;
  /**
   * If provided, `clear()` re-seeds signals via `applyUpdate(reseed())`
   * instead of zeroing them. Use for process-singleton stores whose
   * source of truth (`window.Roblox.CurrentUser`, viewport, …) outlives
   * any single page — without re-seeding, the cached singleton would
   * stay permanently empty after page churn until full reload.
   */
  reseed?: () => R;
}

/**
 * Store with one signal per leaf field, for id-less content types like
 * `responsive` (`screen_width`, `is_portrait`) and `auth` (`user_id`,
 * `username`).
 *
 * `R` (defaults to `EntityData`) lets subclasses narrow the record
 * shape; it flows into `getEntity`, `snapshot`, and the `initial` seed.
 * `getField` stays `unknown` — dynamic path strings aren't tied to `R`'s
 * keys (see `EntityStore.getField`).
 *
 * Internally, `fieldSignals` stays `Map<string, Signal<unknown>>` —
 * field signals are dynamic by name and the per-key signal type can't be
 * meaningfully expressed without a mapped type the runtime can't honor.
 *
 * Lifetime depends on the runtime:
 *
 * - **Browser:** `getInstance()` returns a lazy process singleton, shared
 *   across React mounts and SDUI services bundles for the tab.
 * - **SSR (no `window`):** `getInstance()` returns a fresh per-call
 *   instance. Instances are scoped to the calling
 *   `createSduiServices()` request and dropped with it.
 *
 * The `WeakMap` cache exists only on the browser path.
 *
 * Convention (not enforced by the compiler): production code goes through
 * `XxxStore.getInstance()` rather than `new XxxStore()`. The base class
 * itself is publicly constructible — `new UnkeyedStore({...})` is
 * intentionally allowed so tests can spin up generic, ad-hoc unkeyed
 * stores without having to subclass.
 */
export class UnkeyedStore<R extends EntityData = EntityData> implements HydrationStore {
  // Keyed by subclass constructor; values are `unknown` so subclasses
  // with different `R` share one map. `instanceof this` below is the
  // actual type guard.
  private static readonly instances = new WeakMap<object, unknown>();

  // `<any>` is required: `UnkeyedStore<R>` is invariant in `R`, so a
  // narrowed subclass like `ResponsiveStore` won't satisfy a fixed
  // `this:`. `instanceof this` is the real guard; `T` stays typed.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- see comment above.
  static getInstance<T extends UnkeyedStore<any>>(this: new () => T): T {
    if (typeof window === "undefined") {
      return new this();
    }
    const cached = UnkeyedStore.instances.get(this);
    if (cached instanceof this) return cached;
    const instance = new this();
    UnkeyedStore.instances.set(this, instance);
    return instance;
  }

  /**
   * Test-only: drop the cached singleton for the subclass this method is
   * called on so the next `getInstance()` call constructs a fresh store.
   * Production code must never call this — there is no need to reset a
   * process-scoped store.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- see getInstance comment.
  static __resetForTesting(this: new () => UnkeyedStore<any>): void {
    UnkeyedStore.instances.delete(this);
  }

  protected readonly fieldSignals = new Map<string, Signal<unknown>>();

  /**
   * Whole-record subscription. Bumped on any mutating `applyUpdate`/`clear`
   * so `getEntity` / `getField(_, [])` re-evaluate; field reads bypass it.
   */
  private readonly version = signal(0);

  private readonly reseedFn?: () => R;

  constructor(options: UnkeyedStoreOptions<R> = {}) {
    this.reseedFn = options.reseed;
    if (options.initial) {
      for (const [fieldName, value] of Object.entries(options.initial)) {
        this.fieldSignals.set(fieldName, signal<unknown>(value));
      }
    }
  }

  protected getOrCreateSignal(fieldName: string): Signal<unknown> {
    let fieldSignal = this.fieldSignals.get(fieldName);
    if (!fieldSignal) {
      fieldSignal = signal<unknown>(undefined);
      this.fieldSignals.set(fieldName, fieldSignal);
    }
    return fieldSignal;
  }

  /** Wake whole-record readers; overrides of `applyUpdate`/`clear` must call this when state mutated (inside `batch()`). */
  protected bumpVersion(): void {
    this.version.value = this.version.peek() + 1;
  }

  /** Non-reactive snapshot via `.peek()` (e.g. SSR handoff, `snapshot()`). Keys reflect written signals; shape treated as `R`. */
  protected readSnapshot(): R {
    const result: Record<string, unknown> = {};
    for (const [fieldName, fieldSignal] of this.fieldSignals) {
      const value = fieldSignal.peek();
      if (value !== undefined) result[fieldName] = value;
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- snapshot keys are dynamic; subclasses opt in to the `R` shape.
    return result as R;
  }

  /**
   * Reactive whole-record read for binder paths. Subscribes to the
   * record-level `version` signal so the caller re-evaluates on the next
   * `applyUpdate`/`clear` that mutates state.
   */
  protected readSnapshotReactive(): R {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions -- subscribe to the version signal.
    this.version.value;
    return this.readSnapshot();
  }

  /**
   * Unkeyed stores have no concept of "not yet loaded" — their data is
   * page-attached and present from the moment the page is hydrated. Always
   * report `Ready`; consumers don't render skeleton UI for these stores.
   */
  getField(_id: string, path: string[]): HydrationRead {
    // Resolve the head segment reactively (it's the field signal we
    // subscribe to). Try snake_case first, fall back to camelCase to
    // match the case tolerance in tryGetPathFromData. If neither exists,
    // touch the snake_case key so a future write wakes us.
    const headSegment = path[0];
    if (headSegment === undefined) {
      return { value: this.readSnapshotReactive(), status: DataStatus.Ready };
    }
    let headSignal = this.fieldSignals.get(headSegment);
    if (!headSignal) {
      const camelHead = snakeToCamel(headSegment);
      headSignal = this.fieldSignals.get(camelHead) ?? this.getOrCreateSignal(headSegment);
    }
    const headValue = headSignal.value;
    if (path.length === 1) return { value: headValue, status: DataStatus.Ready };

    return { value: tryGetPathFromData(headValue, path.slice(1)), status: DataStatus.Ready };
  }

  getEntity(_id: string): HydrationRead<R> {
    return { value: this.readSnapshotReactive(), status: DataStatus.Ready };
  }

  /**
   * Signature kept wide for `HydrationStore` interface conformance — the
   * binder dispatches updates without knowing each store's `R`. The runtime
   * is permissive (writes whatever fields are in the payload); writers
   * should pass `R`-shaped payloads.
   */
  applyUpdate(update: EntityData | Record<string, EntityData>): void {
    const nextRecord = update as EntityData;
    // Defensive runtime guard: the binder/network layer can hand us a
    // non-object payload (null, primitive) for malformed responses. The
    // type signature widens to `EntityData` here, but TS can't see that.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- defensive runtime guard against malformed payloads.
    if (!nextRecord || typeof nextRecord !== "object") return;
    batch(() => {
      let mutated = false;
      const seenFields = new Set<string>();
      for (const [fieldName, value] of Object.entries(nextRecord)) {
        seenFields.add(fieldName);
        const fieldSignal = this.getOrCreateSignal(fieldName);
        if (!Object.is(fieldSignal.peek(), value)) {
          fieldSignal.value = value;
          mutated = true;
        }
      }
      for (const [fieldName, fieldSignal] of this.fieldSignals) {
        if (!seenFields.has(fieldName) && fieldSignal.peek() !== undefined) {
          fieldSignal.value = undefined;
          mutated = true;
        }
      }
      if (mutated) this.bumpVersion();
    });
  }

  snapshot(): Map<string, R> {
    const record = this.readSnapshot();
    const result = new Map<string, R>();
    if (Object.keys(record).length > 0) result.set("", record);
    return result;
  }

  clear(): void {
    if (this.reseedFn) {
      this.applyUpdate(this.reseedFn());
      return;
    }
    // Bump signals to undefined so live computeds see the cleared state.
    batch(() => {
      let mutated = false;
      for (const fieldSignal of this.fieldSignals.values()) {
        if (fieldSignal.peek() !== undefined) {
          fieldSignal.value = undefined;
          mutated = true;
        }
      }
      if (mutated) this.bumpVersion();
    });
  }
}
