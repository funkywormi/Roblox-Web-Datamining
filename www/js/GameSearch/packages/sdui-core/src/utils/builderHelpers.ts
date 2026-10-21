import type { DataStatus, PropSignalEntry, SduiComponentConfig } from "../types";

/** True when the built config carries any reactive `propSignals` entries. */
export function hasPropSignals(config: SduiComponentConfig): boolean {
  return config.propSignals != null && Object.keys(config.propSignals).length > 0;
}

/**
 * Snapshot per-prop `DataStatus` via `peek()` for SSR / non-wrapped renders
 * (no `useSignals()` scope). Returns `undefined` when no entry has a status.
 */
export function peekPropStatuses(
  propSignals: Record<string, PropSignalEntry> | undefined,
): Record<string, DataStatus> | undefined {
  if (!propSignals) return undefined;
  const statuses: Record<string, DataStatus> = {};
  for (const [propName, entry] of Object.entries(propSignals)) {
    if (entry.status) {
      statuses[propName] = entry.status.peek();
    }
  }
  return Object.keys(statuses).length > 0 ? statuses : undefined;
}
