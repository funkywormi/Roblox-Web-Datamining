import type { CacheEntry, SduiComponentConfig } from "../../types";
import { pickRootConfig } from "../../utils/apiStoreHelper";

export interface SduiEntryPointState {
  rootConfig: SduiComponentConfig | undefined;
  hasContent: boolean;
  hasErrored: boolean;
  isLoading: boolean;
}

export function resolveEntryPointState(
  entry: CacheEntry | undefined,
  identifier: string | undefined,
): SduiEntryPointState {
  const rootConfig = pickRootConfig(entry, identifier);
  const status = entry?.status ?? "idle";

  return {
    rootConfig,
    hasContent: Boolean(rootConfig) && status !== "error" && status !== "loading",
    hasErrored: status === "error" || (status === "loaded" && !rootConfig),
    isLoading: status === "loading" || status === "idle",
  };
}
