import { useEffect, useState } from "react";
import { window as browserWindow } from "@rbx/core-lib/browser";
import type { SduiComponentConfig } from "@rbx/sdui-core";
import { nonNegativeIntegerOr, positiveIntegerOr } from "@rbx/sdui-core";

type EntryKey = string | SduiComponentConfig;

function entryKeysOf(configs: readonly SduiComponentConfig[]): EntryKey[] {
  return configs.map(config => config.reactKey ?? config);
}

/**
 * Mounts an initial prefix of a list, then grows the visible count in batches.
 *
 * When `initialNumToRender` is unset, the full list is visible immediately.
 * When `progressiveFillIntervalMs` is unset or `<= 0`, the next batch is scheduled ASAP.
 *
 * Fill restarts only when the first entry is new (refresh, prepend, or head
 * replace). Reordering an already-mounted entry to the front, or appending more
 * items with the same head, keeps the current fill progress.
 */
export function useProgressiveItemCount(
  total: number,
  initialNumToRender: number | undefined,
  progressiveFillRate: number | undefined,
  progressiveFillIntervalMs: number | undefined,
  configs: readonly SduiComponentConfig[],
): [visibleCount: number, isFilling: boolean] {
  const isEnabled = initialNumToRender != null;
  const initialCount = isEnabled ? nonNegativeIntegerOr(initialNumToRender, 0) : total;
  const fillRate = positiveIntegerOr(progressiveFillRate, 1);
  const fillIntervalMs = nonNegativeIntegerOr(progressiveFillIntervalMs, 0);
  // TODO(SSR): When this feed is server-rendered, show the full initial payload
  // on SSR/hydration (no progressive slice) to avoid mismatch, then progressive-
  // fill only list growth after mount (async first page + pagination).
  const initialVisibleCount = Math.min(initialCount, total);
  const [count, setCount] = useState(initialVisibleCount);
  const nextKeys = entryKeysOf(configs);
  const leadingKey = nextKeys[0];
  const [trackedKeys, setTrackedKeys] = useState(nextKeys);
  const trackedLeadingKey = trackedKeys[0];

  if (leadingKey !== trackedLeadingKey) {
    // An existing entry moving to the front is a filter/sort. A key we have never
    // seen is a replaced or prepended head — restart fill from the initial prefix.
    const leadingExistedBefore =
      leadingKey != null && trackedKeys.length > 0 && trackedKeys.includes(leadingKey);
    if (!leadingExistedBefore && trackedKeys.length > 0) {
      setCount(initialVisibleCount);
    } else if (count > total) {
      // Same invariant as below: don't keep a stale high count across a shrink.
      setCount(total);
    }
    setTrackedKeys(nextKeys);
  } else if (count > total) {
    // A shorter list must not leave a stale high count that mounts the next page at once.
    setCount(total);
    setTrackedKeys(nextKeys);
  } else if (
    nextKeys.length !== trackedKeys.length ||
    nextKeys.some((key, index) => key !== trackedKeys[index])
  ) {
    setTrackedKeys(nextKeys);
  }

  const visibleCount = isEnabled ? Math.min(Math.max(count, initialCount), total) : total;
  const isFilling = isEnabled && visibleCount < total;

  useEffect(() => {
    const activeWindow = browserWindow;
    if (!isFilling || activeWindow == null) {
      return undefined;
    }

    const timeoutId = activeWindow.setTimeout(() => {
      // Cap at the current length so a later page does not mount items past the old end.
      setCount(currentCount => Math.min(total, Math.max(currentCount, visibleCount) + fillRate));
    }, fillIntervalMs);
    return () => {
      activeWindow.clearTimeout(timeoutId);
    };
  }, [fillIntervalMs, fillRate, isFilling, total, visibleCount]);

  return [visibleCount, isFilling];
}
