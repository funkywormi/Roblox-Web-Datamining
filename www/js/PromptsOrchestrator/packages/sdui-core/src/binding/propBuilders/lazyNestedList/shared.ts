import { computed, type ReadonlySignal } from "@preact/signals-core";
import type { DataBindingSources, ResolvedProp, SduiComponentConfig } from "../../../types";
import type { RecordOf } from "../../../utils/typeGuards";
import { computedEqual } from "../../../signals/computedEqual";

/**
 * Wraps parent data sources with a per-iteration `inputData` overlay
 * (overlay wins on collision).
 */
export function makeOverlayDataSources(
  parentDataSources: ReadonlySignal<DataBindingSources>,
  overlay: RecordOf,
): ReadonlySignal<DataBindingSources> {
  return computed(() => {
    const parent = parentDataSources.value;
    return { ...parent, inputData: { ...parent.inputData, ...overlay } };
  });
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
