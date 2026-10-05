import type { ReadonlySignal } from "@preact/signals-core";

import { coerceAnalyticsScalar } from "../binding/propBuilders/buildAnalyticsFields";
import { shallowEqual } from "../signals/computedEqual";
import type {
  AnalyticsContext,
  AnalyticsFieldMap,
  CollectionAnalyticsData,
  SduiErrorReporter,
  SduiPageContext,
} from "../types";
import { SduiErrorName } from "../errors/SduiErrors";
import { reportError } from "../errors/SduiLogger";

const EMPTY_FIELDS: AnalyticsFieldMap = {};

function computeSnapshot(
  literals: AnalyticsFieldMap | undefined,
  signals: Record<string, ReadonlySignal<unknown>> | undefined,
  localOverrides: AnalyticsFieldMap | undefined,
): AnalyticsFieldMap {
  const snapshot: AnalyticsFieldMap = literals ? { ...literals } : {};

  if (signals) {
    for (const [key, signal] of Object.entries(signals)) {
      // `peek()` (not `.value`) keeps the snapshot non-subscribing so callers
      // reading inside `useSignals()` don't bind every analytics signal in the
      // tree to their render.
      const scalar = coerceAnalyticsScalar(signal.peek());
      if (scalar !== undefined) snapshot[key] = scalar;
    }
  }

  return localOverrides ? { ...snapshot, ...localOverrides } : snapshot;
}

export interface BuildAnalyticsContextOptions {
  /** Static fields from the template. */
  literals?: AnalyticsFieldMap;
  /**
   * Non-subscribing reads for `AnalyticsDataField.binding_path` fields.
   * Snapshot uses `signal.peek()` so analytics never subscribes the renderer.
   */
  signals?: Record<string, ReadonlySignal<unknown>>;
  /** Parent context used for `ancestorAnalyticsData` and collection lookups. */
  parentContext?: AnalyticsContext;
  /** Forwarded to the error reporter for triage on snapshot failures. */
  debugName?: string;
  componentType?: string;
  parserName?: string;
  pageContext?: SduiPageContext;
  errorReporter?: SduiErrorReporter;
}

/**
 * Builds the per-component analytics context that powers impressions/clicks
 * telemetry. Combines template literals, binding-path-bound signals (read
 * fresh on each snapshot), a runtime overlay set by collection components,
 * and an inherited ancestor chain.
 *
 * Mirrors Lua's `buildAnalyticsContextForClientBinding`.
 *
 * Read precedence: `literals → signals → locals` (locals win).
 */
export function buildAnalyticsContext(
  options: BuildAnalyticsContextOptions = {},
): AnalyticsContext {
  const {
    literals,
    signals,
    parentContext,
    debugName,
    componentType,
    parserName,
    pageContext,
    errorReporter,
  } = options;

  // Set later by collection/list components via `setLocalAnalyticsData`; layered
  // on top of literals and signals at snapshot time.
  let localOverrides: AnalyticsFieldMap | undefined;
  // Set by collection components via `setCollectionData` so item children resolve
  // collection context for click/impression analytics.
  let localCollectionData: CollectionAnalyticsData | undefined;

  const context: AnalyticsContext = {
    getAnalyticsDataSnapshot(): AnalyticsFieldMap {
      try {
        return computeSnapshot(literals, signals, localOverrides);
      } catch (err) {
        reportError(
          SduiErrorName.FailedToComputeAnalyticsData,
          err instanceof Error ? err.message : String(err),
          pageContext,
          { name: debugName, componentType, parserName },
          errorReporter,
        );
        return {};
      }
    },

    getAncestorAnalyticsDataSnapshot(): AnalyticsFieldMap {
      if (!parentContext) return EMPTY_FIELDS;
      // Prefer cached getter-backed props on the parent; fall back to the
      // snapshot methods for hosts that build contexts without them.
      const ancestor =
        parentContext.ancestorAnalyticsData ?? parentContext.getAncestorAnalyticsDataSnapshot();
      const own = parentContext.analyticsData ?? parentContext.getAnalyticsDataSnapshot();
      return { ...ancestor, ...own };
    },

    setLocalAnalyticsData(fields: AnalyticsFieldMap): void {
      localOverrides = localOverrides ? { ...localOverrides, ...fields } : fields;
    },

    setCollectionData(data: CollectionAnalyticsData): void {
      localCollectionData = data;
    },

    getCollectionData(): CollectionAnalyticsData | undefined {
      return localCollectionData ?? parentContext?.getCollectionData?.();
    },

    // Lazy accessors so `ctx.analyticsData` / `ctx.ancestorAnalyticsData` reads
    // re-evaluate on every access, picking up runtime overlays and fresh
    // binding-path values.
    get analyticsData(): AnalyticsFieldMap {
      return context.getAnalyticsDataSnapshot();
    },
    get ancestorAnalyticsData(): AnalyticsFieldMap {
      return context.getAncestorAnalyticsDataSnapshot();
    },
  };

  return context;
}

/**
 * Shallow comparison of two analytics contexts for `React.memo` boundaries.
 * Compares materialized `analyticsData` / `ancestorAnalyticsData` rather than
 * the lazy function references, which change every render.
 */
export function compareSduiAnalyticsContext(
  a: AnalyticsContext | undefined,
  b: AnalyticsContext | undefined,
): boolean {
  if (a === b) return true;
  if (!a || !b) return false;
  if (!shallowEqual(a.analyticsData, b.analyticsData)) return false;
  if (!shallowEqual(a.ancestorAnalyticsData, b.ancestorAnalyticsData)) return false;
  return true;
}
