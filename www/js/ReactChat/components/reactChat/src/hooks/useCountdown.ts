import { useEffect, useRef, useState } from "react";

/** Formats remaining time as `h:mm:ss` (with hours) or `m:ss`. */
export const formatCountdown = (remainingMs: number): string => {
  const totalSeconds = Math.max(0, Math.ceil(remainingMs / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (value: number) => String(value).padStart(2, "0");
  return hours > 0 ? `${hours}:${pad(minutes)}:${pad(seconds)}` : `${minutes}:${pad(seconds)}`;
};

/**
 * Live countdown to `endTimeMs`, returning the formatted label. Recomputes from `Date.now()` each
 * tick (drift-corrected, so it stays accurate after the tab is backgrounded) and fires `onExpiry`
 * once when it reaches zero.
 */
export const useCountdown = (
  endTimeMs: number | null | undefined,
  onExpiry?: () => void,
): string => {
  const [nowMs, setNowMs] = useState(() => Date.now());
  const onExpiryRef = useRef(onExpiry);
  onExpiryRef.current = onExpiry;

  useEffect(() => {
    if (endTimeMs == null) {
      return undefined;
    }
    let fired = false;
    const fireOnce = () => {
      if (!fired) {
        fired = true;
        onExpiryRef.current?.();
      }
    };

    const current = Date.now();
    setNowMs(current);
    if (current >= endTimeMs) {
      fireOnce();
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      const tickNow = Date.now();
      setNowMs(tickNow);
      if (tickNow >= endTimeMs) {
        fireOnce();
        window.clearInterval(intervalId);
      }
    }, 1000);
    return () => {
      window.clearInterval(intervalId);
    };
  }, [endTimeMs]);

  if (endTimeMs == null) {
    return "";
  }
  return formatCountdown(endTimeMs - nowMs);
};

export default useCountdown;
