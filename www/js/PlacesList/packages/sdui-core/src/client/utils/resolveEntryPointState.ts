import type { CacheEntry, SduiComponentConfig } from "../../types";
import { pickRootConfig } from "../../utils/apiStoreHelper";

export interface SduiEntryPointState {
  rootConfig: SduiComponentConfig | undefined;
  hasContent: boolean;
  hasErrored: boolean;
  isLoading: boolean;
}

type ResolveEntryPointStateOptions = {
  /**
   * Supports the streaming case where content can be continuously streamed in
   */
  isContentAllowedWhileLoading?: boolean;
};

export function resolveEntryPointState(
  entry: CacheEntry | undefined,
  identifier: string | undefined,
  options?: ResolveEntryPointStateOptions,
): SduiEntryPointState {
  const rootConfig = pickRootConfig(entry, identifier);
  const status = entry?.status ?? "idle";
  const isLoading = status === "loading" || status === "idle";
  const hasContent =
    Boolean(rootConfig) &&
    ((status !== "error" && status !== "loading") ||
      (status === "loading" && options?.isContentAllowedWhileLoading === true));

  return {
    rootConfig,
    hasContent,
    hasErrored: status === "error" || (status === "loaded" && !rootConfig),
    isLoading,
  };
}
