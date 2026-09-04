import type { SduiComponentConfig } from "../types";

/**
 * Drops `keys` from a nested config's `propSignals` so the parent can inject
 * plain props for those keys.
 *
 * Prop signals resolve after plain props, so a child whose own template binds
 * one of the keys the parent owns would otherwise overwrite the injected value.
 * Collapses to `undefined` once nothing is left, keeping the config free of an
 * empty signal map.
 */
export function omitPropSignals(
  propSignals: SduiComponentConfig["propSignals"],
  keys: readonly string[],
): SduiComponentConfig["propSignals"] {
  if (!propSignals) {
    return undefined;
  }

  const omittedKeys = new Set(keys);
  const remaining = Object.entries(propSignals).filter(([key]) => !omittedKeys.has(key));
  return remaining.length > 0 ? Object.fromEntries(remaining) : undefined;
}
