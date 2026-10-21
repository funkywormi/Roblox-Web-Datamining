import { CacheStatus, type SduiApiStore } from "@rbx/sdui-core";
import { useSduiCacheSubscription } from "@rbx/sdui-core/client";

function isNonEmptyRecord(value: unknown): boolean {
  return (
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    Object.keys(value).length > 0
  );
}

function isNonEmptyArray(value: unknown): boolean {
  return Array.isArray(value) && value.length > 0;
}

function isSearchResultsFeedEmpty(
  status: CacheStatus | undefined,
  inputData: Record<string, unknown> | undefined,
): boolean {
  if (status !== CacheStatus.Loaded || inputData == null) {
    return false;
  }

  const { entryOrder, entryMap } = inputData;
  const isValidEntryMap = isNonEmptyRecord(entryMap);

  // Missing order: the map alone can still render. Empty only when that map is empty.
  if (entryOrder == null) {
    return !isValidEntryMap;
  }

  const isValidEntryOrder = isNonEmptyArray(entryOrder);
  return !isValidEntryOrder || !isValidEntryMap;
}

export function useIsSearchResultsFeedEmpty(
  apiStore: SduiApiStore,
  configKey: string,
  feedIdentifier: string,
): boolean {
  const cacheEntry = useSduiCacheSubscription(apiStore, configKey);
  const feedInputData = apiStore.getInputDataSignal(configKey, feedIdentifier).value;
  return isSearchResultsFeedEmpty(cacheEntry?.status, feedInputData);
}
