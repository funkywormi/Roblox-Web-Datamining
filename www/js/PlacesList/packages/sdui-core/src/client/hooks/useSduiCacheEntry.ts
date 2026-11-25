import { useMemo } from "react";
import { useSignals } from "@preact/signals-react/runtime";

import type { CacheStatus, SduiApiStore, SduiComponentConfig } from "../../types";
import { pickRootConfig } from "../../utils/apiStoreHelper";
import { useSduiServices } from "../context/SduiProvider";

export interface SduiCacheEntryView {
  rootConfig: SduiComponentConfig | undefined;
  status: CacheStatus;
  error: Error | undefined;
  hasErrored: boolean;
}

export function useSduiCacheSubscription(apiStore: SduiApiStore, configKey: string) {
  useSignals();
  return apiStore.getCacheSignal(configKey).value;
}

/**
 * Reactive accessor for a cache entry by `configKey`. Subscribes the
 * current render so components re-render when the entry updates.
 */
export function useSduiCacheEntry(configKey: string, identifier?: string): SduiCacheEntryView {
  const { apiStore } = useSduiServices();
  const entry = useSduiCacheSubscription(apiStore, configKey);

  return useMemo(
    () => ({
      rootConfig: pickRootConfig(entry, identifier),
      status: entry?.status ?? "idle",
      error: entry?.error,
      hasErrored: entry?.status === "error" || entry?.error != null,
    }),
    [entry, identifier],
  );
}
