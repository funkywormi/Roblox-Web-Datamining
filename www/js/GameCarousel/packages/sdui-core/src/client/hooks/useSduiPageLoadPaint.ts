import { useLayoutEffect, useRef } from "react";

import { useSduiServices } from "../context/SduiProvider";

/**
 * Records first SDUI commit + paint for the page-load EventIngest gate.
 * No-ops when `isRenderable` is false (loading / error). Fires once per
 * `configKey` for the lifetime of the calling component mount.
 *
 * Paint is detected with rAF + setTimeout(0): rAF runs before the next
 * paint, and the timeout is queued after the rendering steps so it
 * lands closer to the actual paint than a nested rAF.
 */
export function useSduiPageLoadPaint(configKey: string, isRenderable: boolean): void {
  const { loadTimerRegistry } = useSduiServices();
  const paintedConfigKeyRef = useRef<string | null>(null);

  useLayoutEffect(() => {
    if (!isRenderable || paintedConfigKeyRef.current === configKey) return;

    const timer = loadTimerRegistry.get(configKey);
    if (!timer) return;

    timer.logComponentMounted();

    if (typeof requestAnimationFrame !== "function") {
      paintedConfigKeyRef.current = configKey;
      timer.logComponentPainted();
      return;
    }

    let cancelled = false;
    let paintTimeout: ReturnType<typeof setTimeout> | undefined;
    const frame = requestAnimationFrame(() => {
      paintTimeout = setTimeout(() => {
        if (cancelled) return;
        paintedConfigKeyRef.current = configKey;
        timer.logComponentPainted();
      }, 0);
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      if (paintTimeout !== undefined) {
        clearTimeout(paintTimeout);
      }
    };
  }, [configKey, isRenderable, loadTimerRegistry]);
}
