import type {
  ApiRequestConfig,
  CacheEntry,
  SduiComponentConfig,
  SduiInputDataMergeStrategy,
  SduiInputDataMergeStrategyResolver,
} from "../types";
import { isRecord, isUnknownArray } from "./typeGuards";

/** Canonical cache key for an SDUI request. */
export function getConfigKey(requestConfig: ApiRequestConfig): string {
  return requestConfig.configKey ?? requestConfig.surfaceKey;
}

/**
 * Resolve the root `SduiComponentConfig` from a cache entry. When
 * `identifier` is provided returns that specific config; otherwise returns
 * the first one.
 */
// TODO: Rename to a more generic name — this selects any config by identifier, not just root.
export function pickRootConfig(
  entry: CacheEntry | undefined,
  identifier?: string,
): SduiComponentConfig | undefined {
  if (!entry) return undefined;
  if (identifier) return entry.configs.get(identifier);
  return entry.configs.values().next().value;
}

export function applyInputDataMergeStrategy(
  strategy: SduiInputDataMergeStrategy,
  existingValue: unknown,
  incomingValue: unknown,
): unknown {
  if (strategy === "replace") {
    return incomingValue;
  }

  if (isUnknownArray(existingValue) && isUnknownArray(incomingValue)) {
    if (strategy === "append") {
      return [...existingValue, ...incomingValue];
    }

    const mergedArray = [...existingValue];
    incomingValue.forEach((value, index) => {
      mergedArray[index] = value;
    });
    return mergedArray;
  }

  if (isRecord(existingValue) && isRecord(incomingValue)) {
    return { ...existingValue, ...incomingValue };
  }

  return incomingValue;
}

function mergeInputDataValue(
  existingValue: unknown,
  incomingValue: unknown,
  path: readonly string[],
  strategyResolver?: SduiInputDataMergeStrategyResolver,
): unknown {
  const canResolveStrategy =
    path.length > 0 && (isRecord(incomingValue) || isUnknownArray(incomingValue));
  const strategy = canResolveStrategy
    ? strategyResolver?.(path, existingValue, incomingValue)
    : undefined;
  if (strategy) {
    return applyInputDataMergeStrategy(strategy, existingValue, incomingValue);
  }

  // Default strategy for arrays is to append.
  if (isUnknownArray(existingValue) && isUnknownArray(incomingValue)) {
    return [...existingValue, ...incomingValue];
  }

  // Default strategy for records is to merge.
  if (isRecord(existingValue) && isRecord(incomingValue)) {
    const mergedRecord: Record<string, unknown> = { ...existingValue };
    for (const [key, childIncomingValue] of Object.entries(incomingValue)) {
      mergedRecord[key] = mergeInputDataValue(
        existingValue[key],
        childIncomingValue,
        [...path, key],
        strategyResolver,
      );
    }
    return mergedRecord;
  }

  return incomingValue;
}

/**
 * Immutably merges incoming input data. A consumer resolver can choose an
 * atomic strategy at any path; otherwise records recurse, arrays append, and
 * scalar values are replaced.
 */
export function mergeInputData(
  existing: Record<string, unknown>,
  incoming: Record<string, unknown>,
  strategyResolver?: SduiInputDataMergeStrategyResolver,
): Record<string, unknown> {
  const mergedValue = mergeInputDataValue(existing, incoming, [], strategyResolver);
  return isRecord(mergedValue) ? mergedValue : incoming;
}
