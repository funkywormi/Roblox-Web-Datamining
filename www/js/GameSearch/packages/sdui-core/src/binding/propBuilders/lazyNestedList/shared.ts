import { computed, type ReadonlySignal } from "@preact/signals-core";
import type { DataBindingSources, ResolvedProp, SduiComponentConfig } from "../../../types";
import type { RecordOf } from "../../../utils/typeGuards";
import { computedEqual } from "../../../signals/computedEqual";

/**
 * Overlays `inputData` onto parent sources (overlay wins on collision) and
 * drops overlay-owned keys from `pendingInputKeys` so a row cannot inherit
 * the parent's pending status for fields it supplies.
 *
 * Hydration `sources` / `pendingEntitySourceKeys` stay the parent's: overlay does
 * not rebuild entity IDs from the overlaid record.
 */
export function overlayDataSources(
  parent: DataBindingSources,
  overlay: RecordOf,
): DataBindingSources {
  const pendingInputKeys = new Set(parent.pendingInputKeys);
  for (const key of Object.keys(overlay)) {
    pendingInputKeys.delete(key);
  }
  return {
    ...parent,
    inputData: { ...parent.inputData, ...overlay },
    pendingInputKeys,
  };
}

/**
 * Reactive wrapper around {@link overlayDataSources} for a static overlay.
 */
export function makeOverlayDataSources(
  parentDataSources: ReadonlySignal<DataBindingSources>,
  overlay: RecordOf,
): ReadonlySignal<DataBindingSources> {
  return computed(() => overlayDataSources(parentDataSources.value, overlay));
}

/**
 * Reference-equality short-circuit for the visible-children list. Configs
 * are stable across re-evaluations, so per-element `===` is sufficient.
 */
export function arrayRefEqual(a: unknown, b: unknown): boolean {
  if (!Array.isArray(a) || !Array.isArray(b)) return a === b;
  if (a.length !== b.length) return false;
  return a.every((item, i) => item === b[i]);
}

/** A config without a filter signal is always visible. */
export function isComponentVisible(config: SduiComponentConfig): boolean {
  if (config.isComponentFilteredSignal == null) return true;
  return !config.isComponentFilteredSignal.value;
}

/**
 * An empty list `ResolvedProp` backed by a stable propSignal. Returned by list
 * prop builders as the safe fallback when the source is missing/invalid so a
 * single bad list prop renders as empty instead of breaking the tree.
 */
const EMPTY_LIST_PROP: ResolvedProp = Object.freeze({
  value: [],
  category: "propSignal",
  signal: computedEqual<SduiComponentConfig[]>(() => [], arrayRefEqual),
});

export function emptyListPropSignal(): ResolvedProp {
  return EMPTY_LIST_PROP;
}
