import { batch, type ReadonlySignal } from "@preact/signals-core";

import { SduiErrorName } from "../errors/SduiErrors";
import { reportError } from "../errors/SduiLogger";
import { computedEqual } from "../signals/computedEqual";
import type {
  BindingContext,
  HydrationRead,
  HydrationStore,
  HydrationStoreMap,
  DataBindingSource,
  DataBindingSources,
  HydrationDataSpec,
  SduiDataBinder,
  SduiErrorReporter,
  SduiPageContext,
} from "../types";
import { DataStatus, NOT_READY_READ, READY_UNDEFINED_READ } from "../types";
import { CLIENT_PAGE_SCOPE_CONTENT_TYPE, DEFAULT_PATHS_BY_CONTENT_TYPE } from "./stores";
import { tryGetPathFromData } from "./tryGetPathFromData";

// `undefined | null | ""` all mean "no usable id" — fall back to default paths.
function isMissingId(id: unknown): boolean {
  return id === undefined || id === null || id === "";
}

const EMPTY_KEY_SET: ReadonlySet<string> = new Set();

function setsEqual(a: ReadonlySet<string>, b: ReadonlySet<string>): boolean {
  return a.size === b.size && [...a].every(key => b.has(key));
}

export interface CreateSduiDataBinderOptions {
  /**
   * Eagerly registered stores. Production callers go through
   * `createSduiServices`, which auto-registers `createHydrationStores()`.
   */
  initialStores?: Record<string, HydrationStore>;
  /**
   * Telemetry sink for binder-owned events that have no per-prop
   * `BindingContext` in scope (e.g. `updateDataStores` failures).
   * Prop builders MUST go through `BindingContext.errorReporter` instead.
   */
  errorReporter?: SduiErrorReporter;
  /** Page context attached to binder-owned events for dashboard grouping. */
  pageContext?: SduiPageContext;
}

/**
 * Owns hydration stores and exposes `getField` / `getEntity` reads to prop
 * builders. The binder's `errorReporter` / `pageContext` are reserved for
 * hydration-write events with no per-prop ctx; prop telemetry threads
 * through `BindingContext`.
 */
export function createSduiDataBinder(options?: CreateSduiDataBinderOptions): SduiDataBinder {
  const stores = new Map<string, HydrationStore>();
  const warnedMissingContentTypes = new Set<string>();
  const binderErrorReporter = options?.errorReporter;
  const binderPageContext = options?.pageContext;

  if (options?.initialStores) {
    for (const [contentType, store] of Object.entries(options.initialStores)) {
      stores.set(contentType, store);
    }
  }

  return {
    updateDataStores(hydrationData) {
      batch(() => {
        for (const [contentType, entities] of Object.entries(hydrationData)) {
          const store = stores.get(contentType);
          if (!store) {
            // First miss per content-type fires telemetry; further misses
            // dedupe via `SduiLogger` plus the local set.
            if (!warnedMissingContentTypes.has(contentType)) {
              warnedMissingContentTypes.add(contentType);
              reportError(
                SduiErrorName.HydrationContentTypeNotRegistered,
                `updateDataStores: no store registered for contentType="${contentType}". ` +
                  `Add an XyzStore class under binding/stores/ and register it via createHydrationStores ` +
                  `or pass it explicitly in the entry point's "stores" prop.`,
                binderPageContext,
                { contentType },
                binderErrorReporter,
              );
            }
            continue;
          }
          // Isolate per-store failures so one malformed payload doesn't
          // abort writes for sibling content types in the same batch.
          try {
            store.applyUpdate(entities);
          } catch (err) {
            reportError(
              SduiErrorName.FailedToUpdateDataStores,
              err instanceof Error ? err.message : String(err),
              binderPageContext,
              { contentType },
              binderErrorReporter,
            );
          }
        }
      });
    },

    getField(contentType, path, id) {
      const store = stores.get(contentType);
      if (!store) return NOT_READY_READ;
      return store.getField(id, path);
    },

    getEntity(contentType, id) {
      const store = stores.get(contentType);
      if (!store) return NOT_READY_READ;
      return store.getEntity(id);
    },

    getStores() {
      const snapshot: HydrationStoreMap = new Map();
      for (const [contentType, store] of stores) {
        const data = store.snapshot();
        // Skip empty snapshots and unkeyed-store sentinel (single id `""`)
        // — neither is meaningful in the entity-keyed shape SSR consumers expect.
        if (data.size === 0) continue;
        if (data.size === 1 && data.has("")) continue;
        snapshot.set(contentType, data);
      }
      return snapshot;
    },

    clear() {
      batch(() => {
        for (const store of stores.values()) {
          store.clear();
        }
      });
    },

    registerStore(contentType, store) {
      const previous = stores.get(contentType);
      stores.set(contentType, store);
      // Re-registering re-arms the missing-store warning so a later fix
      // during the session silences future warnings.
      warnedMissingContentTypes.delete(contentType);
      return previous;
    },

    unregisterStore(contentType) {
      const store = stores.get(contentType);
      stores.delete(contentType);
      return store;
    },

    hasStore(contentType) {
      return stores.has(contentType);
    },

    getStore(contentType) {
      return stores.get(contentType);
    },

    forEachStore(callback) {
      for (const [contentType, store] of stores) {
        callback(contentType, store);
      }
    },
  };
}

function resolveInputPath(
  inputData: Record<string, unknown>,
  inputPath: string,
  ctx: BindingContext,
): unknown {
  if (!inputPath || typeof inputPath !== "string") {
    reportError(
      SduiErrorName.InvalidHydrationInputPath,
      `inputPath must be a non-empty string; got ${typeof inputPath}`,
      ctx.pageContext,
      {
        componentType: ctx.componentType,
        propName: ctx.propName,
        bindingPath: inputPath,
      },
      ctx.errorReporter,
    );
    return undefined;
  }
  return tryGetPathFromData(inputData, inputPath.split("."));
}

/**
 * Build a reactive `DataBindingSources` signal from a template's hydration
 * specs and a page entry's `inputDataSignal`. Each spec's id resolution
 * runs inside the computed so input flips (pagination, parent input
 * change) re-flow into downstream `resolveBindingPath` consumers.
 *
 * `HydrationDataSpec.idSource` discriminator (mirrors proto `id_binding` oneof):
 * - `"literal"`   — use `literalId` verbatim. Default-path fallback never applies.
 * - `"inputPath"` — resolve `inputPath` against `inputData`.
 * - `"none"`      — no id source on the spec.
 *
 * When non-literal resolution yields `undefined`, falls back to per-content-type
 * default keys from `DEFAULT_PATHS_BY_CONTENT_TYPE`. Unresolved ids surface as
 * deduped `FailedToBuildBindingSources` telemetry.
 */
export function buildDataBindingSourcesSignal(
  inputDataSignal: ReadonlySignal<Record<string, unknown> | undefined>,
  hydrationDataSpecs: HydrationDataSpec[] | undefined,
  ctx: BindingContext,
  pendingInputKeysSignal?: ReadonlySignal<ReadonlySet<string>>,
): ReadonlySignal<DataBindingSources> {
  // Truly unkeyed specs (`idSource: "none"` with no default ID path) must
  // remain eligible for direct-store lookup. Every other spec is intended
  // to resolve an entity ID, so retain its key even while that ID is absent;
  // this prevents alias-less specs from falling through to an empty-ID read.
  const entitySourceKeys = new Set(
    hydrationDataSpecs
      ?.filter(
        spec =>
          spec.idSource !== "none" || DEFAULT_PATHS_BY_CONTENT_TYPE[spec.contentType] !== undefined,
      )
      .map(spec => spec.alias || spec.contentType) ?? [],
  );

  return computedEqual(
    () => {
      // Store-owned input-data signals start as `undefined` and flip to a
      // record on first seed.
      const inputDataValue = inputDataSignal.value;
      const inputData = inputDataValue ?? {};
      const isInputDataReady = inputDataValue !== undefined;
      const pendingInputKeys = pendingInputKeysSignal?.value ?? EMPTY_KEY_SET;
      const pendingEntitySourceKeys = new Set<string>();
      const sources: DataBindingSource[] = [];
      const sourcesByKey = new Map<string, DataBindingSource>();

      if (hydrationDataSpecs) {
        for (const spec of hydrationDataSpecs) {
          let id: unknown;
          let isEntityIdPending = false;
          switch (spec.idSource) {
            case "literal":
              id = spec.literalId;
              break;
            case "inputPath":
              id = resolveInputPath(inputData, spec.inputPath, ctx);
              isEntityIdPending = pendingInputKeys.has(spec.inputPath.split(".")[0] ?? "");
              break;
            case "none":
              break;
          }

          if (isMissingId(id) && spec.idSource !== "literal") {
            const defaultPaths = DEFAULT_PATHS_BY_CONTENT_TYPE[spec.contentType];
            if (defaultPaths) {
              for (const defaultKey of defaultPaths) {
                id = inputData[defaultKey];
                if (!isMissingId(id)) {
                  isEntityIdPending = pendingInputKeys.has(defaultKey);
                  break;
                }
                if (pendingInputKeys.has(defaultKey)) isEntityIdPending = true;
              }
            }
          }

          if (isEntityIdPending) {
            pendingEntitySourceKeys.add(spec.alias || spec.contentType);
            continue;
          }

          if (!isMissingId(id)) {
            // Reject non-scalar ids before stringifying — `String({...})`
            // produces `"[object Object]"` and silently poisons store keys.
            if (typeof id !== "string" && typeof id !== "number" && typeof id !== "bigint") {
              reportError(
                SduiErrorName.FailedToBuildBindingSources,
                `resolved id for contentType="${spec.contentType}" was not scalar (got ${typeof id})`,
                ctx.pageContext,
                {
                  contentType: spec.contentType,
                  componentType: ctx.componentType,
                  propName: ctx.propName,
                },
                ctx.errorReporter,
              );
              continue;
            }
            const source: DataBindingSource = {
              contentType: spec.contentType,
              id: String(id),
              alias: spec.alias,
            };
            sources.push(source);
            // Keyed map for O(1) head-segment lookup in `resolveBindingPath`.
            // Alias wins when present so multiple sources of the same
            // contentType stay disambiguated.
            sourcesByKey.set(spec.alias || spec.contentType, source);
            continue;
          }

          const debugPath =
            spec.idSource === "literal"
              ? `literal:${spec.literalId}`
              : spec.idSource === "inputPath"
                ? spec.inputPath
                : "(none)";
          reportError(
            SduiErrorName.FailedToBuildBindingSources,
            `could not resolve entity ID for contentType="${spec.contentType}", ` +
              `idSource="${spec.idSource}", path="${debugPath}", alias="${spec.alias}"`,
            ctx.pageContext,
            {
              contentType: spec.contentType,
              componentType: ctx.componentType,
              propName: ctx.propName,
              bindingPath: debugPath,
            },
            ctx.errorReporter,
          );
        }
      }

      return {
        sources,
        sourcesByKey,
        entitySourceKeys,
        pendingInputKeys,
        pendingEntitySourceKeys,
        inputData,
        isInputDataReady,
      };
    },
    // Equality: structural compare on `sources` + reference equality on
    // `inputData`. `sourcesByKey` parity follows from `sources` parity, and
    // `entitySourceKeys` is stable for the lifetime of this computed.
    // On equal, `computedEqual` returns the previous value so downstream
    // consumers don't re-run on no-op input flips.
    (prev, next) => {
      if (prev.inputData !== next.inputData) return false;
      if (prev.isInputDataReady !== next.isInputDataReady) return false;
      if (!setsEqual(prev.pendingInputKeys, next.pendingInputKeys)) return false;
      if (!setsEqual(prev.pendingEntitySourceKeys, next.pendingEntitySourceKeys)) return false;
      if (prev.sources.length !== next.sources.length) return false;
      for (let i = 0; i < prev.sources.length; i += 1) {
        const prevSource = prev.sources[i];
        const nextSource = next.sources[i];
        if (!prevSource || !nextSource) return false;
        if (
          prevSource.contentType !== nextSource.contentType ||
          prevSource.id !== nextSource.id ||
          prevSource.alias !== nextSource.alias
        ) {
          return false;
        }
      }
      return true;
    },
  );
}

/**
 * Read a `HydrationRead` out of `source` at `fieldPath`.
 *
 * Single-segment binding paths (no `fieldPath`) return the full entity.
 */
function resolveFromSource(
  source: DataBindingSource,
  fieldPath: string[],
  dataBinder: SduiDataBinder,
): HydrationRead {
  if (fieldPath.length === 0) {
    return dataBinder.getEntity(source.contentType, source.id);
  }
  return dataBinder.getField(source.contentType, fieldPath, source.id);
}

/**
 * Resolve a binding path (e.g. `"b.displayName"`) against `dataSources` and
 * the binder's stores. Returns a `HydrationRead` carrying value + status.
 *
 * Resolution order:
 * 1. Pending isolated-scope input key — `NOT_READY_READ`.
 * 2. Present input data, full path — `Ready`.
 * 3. Hydration source via `sourcesByKey[head]` — store's per-id status.
 * 4. Hydration source whose entity ID input is pending — `NOT_READY_READ`.
 * 5. Unresolved entity source — `NOT_READY_READ` before input seed,
 *    `READY_UNDEFINED_READ` afterward.
 * 6. Direct store lookup on `head` — `clientPageScope` uses `ctx.configKey`
 *    as its entity id; unkeyed stores (`responsive`, `auth`) use an empty id.
 * 7. Other miss before input data's first seed — `NOT_READY_READ`.
 * 8. Other miss after input data is ready — `READY_UNDEFINED_READ`. At that point,
 *    a head that is neither an alias nor a registered store names an absent
 *    input-data field. Reporting `NotReady` would strand `conditional` props:
 *    option selection stops at the first non-`Ready` condition, so a branch
 *    testing a field that only exists on a few payloads (e.g.
 *    `universe_items` on a song feed) would block every later branch forever.
 *
 * Telemetry: fires `InvalidBindingPath` for shape bugs (non-string, empty)
 * but not for paths that resolve to `undefined` — that's a legitimate
 * partial-hydration state. Reads `ctx.errorReporter` / `ctx.pageContext`,
 * never the binder's constructor-time reporter.
 *
 * `dataSources` is a signal: reading `.value` subscribes the caller to
 * source-level updates so input-data flips propagate transitively.
 */
export function resolveBindingPath(
  bindingPath: string,
  dataSources: ReadonlySignal<DataBindingSources>,
  dataBinder: SduiDataBinder,
  ctx: BindingContext,
): HydrationRead {
  if (!bindingPath || typeof bindingPath !== "string") {
    reportError(
      SduiErrorName.InvalidBindingPath,
      `bindingPath must be a non-empty string; got ${typeof bindingPath}`,
      ctx.pageContext,
      {
        bindingPath,
        componentType: ctx.componentType,
        propName: ctx.propName,
      },
      ctx.errorReporter,
    );
    return NOT_READY_READ;
  }
  const segments = bindingPath.split(".");
  const head = segments[0];
  if (head === undefined) return NOT_READY_READ;
  const fieldPath = segments.slice(1);
  const bindingSources = dataSources.value;

  if (bindingSources.pendingInputKeys.has(head)) return NOT_READY_READ;

  const inputValue = tryGetPathFromData(bindingSources.inputData, segments);
  if (inputValue !== undefined) return { value: inputValue, status: DataStatus.Ready };

  const source = bindingSources.sourcesByKey.get(head);
  if (source) return resolveFromSource(source, fieldPath, dataBinder);

  if (bindingSources.pendingEntitySourceKeys.has(head)) return NOT_READY_READ;

  if (bindingSources.entitySourceKeys.has(head)) {
    return bindingSources.isInputDataReady ? READY_UNDEFINED_READ : NOT_READY_READ;
  }

  if (dataBinder.hasStore(head)) {
    if (head === CLIENT_PAGE_SCOPE_CONTENT_TYPE) {
      if (!ctx.configKey || fieldPath.length === 0) return READY_UNDEFINED_READ;
      return dataBinder.getField(head, fieldPath, ctx.configKey);
    }
    return dataBinder.getField(head, fieldPath, "");
  }

  return bindingSources.isInputDataReady ? READY_UNDEFINED_READ : NOT_READY_READ;
}
