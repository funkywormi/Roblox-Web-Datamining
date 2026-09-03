/**
 * Default per-request timeout for SDUI API calls. Override per-request via
 * `ApiRequestConfig.timeoutMs`. Set to `0` to disable timeout.
 */
export const DEFAULT_SDUI_REQUEST_TIMEOUT_MS = 10_000;

export interface BuiltRequestSignal {
  signal: AbortSignal;
  cleanup: () => void;
}

function isAbortSignal(value: AbortSignal | readonly AbortSignal[]): value is AbortSignal {
  return !Array.isArray(value);
}

/**
 * Compose a request `AbortSignal` from optional caller signals and a
 * timeout.
 *
 * @param timeoutMs - Pass `timeoutMs <= 0` to disable the timeout while still
 * respecting the caller signal (useful for streamed / chunked endpoints once
 * we get them).
 * @param callerSignals - Optional caller-owned signal(s); aborting any one
 * aborts the composed signal.
 */
export function buildRequestSignal(
  timeoutMs: number,
  callerSignals?: AbortSignal | readonly AbortSignal[],
): BuiltRequestSignal {
  const controller = new AbortController();
  const signals: readonly AbortSignal[] =
    callerSignals === undefined
      ? []
      : isAbortSignal(callerSignals)
        ? [callerSignals]
        : callerSignals;
  const abortedSignal = signals.find(signal => signal.aborted);

  if (abortedSignal) {
    controller.abort(abortedSignal.reason);
    // Nothing to schedule or attach — the composite signal is already
    // aborted, so cleanup is a no-op kept for an unconditional caller API.
    return {
      signal: controller.signal,
      cleanup: () => {
        // intentionally empty
      },
    };
  }

  let timeoutHandle: ReturnType<typeof setTimeout> | undefined;
  if (timeoutMs > 0) {
    timeoutHandle = setTimeout(() => {
      controller.abort(
        new DOMException(`SDUI request timed out after ${timeoutMs}ms`, "TimeoutError"),
      );
    }, timeoutMs);
  }

  const callerAbortListeners = signals.map(signal => {
    const listener = () => {
      controller.abort(signal.reason);
    };
    signal.addEventListener("abort", listener, { once: true });
    return { signal, listener };
  });

  const cleanup = (): void => {
    if (timeoutHandle !== undefined) {
      clearTimeout(timeoutHandle);
      timeoutHandle = undefined;
    }
    for (const { signal, listener } of callerAbortListeners) {
      signal.removeEventListener("abort", listener);
    }
  };

  return { signal: controller.signal, cleanup };
}
