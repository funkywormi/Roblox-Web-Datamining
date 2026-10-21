import type { SduiAnalyticsReporter, SduiPageContext } from "../types/analytics";
import type { SduiErrorReporter } from "../types/error";
import type {
  SduiLoadTimer,
  SduiPageLoadPlatformAdapter,
  SduiWebVitalsObserver,
} from "../types/performance";
import { createSduiLoadTimer } from "./SduiLoadTimer";

export interface ResetLoadTimerOptions {
  pageContext?: SduiPageContext;
}

export interface CreateSduiLoadTimerRegistryOptions {
  analyticsReporter?: SduiAnalyticsReporter;
  observeWebVitals?: SduiWebVitalsObserver;
  pageLoadPlatformAdapter?: SduiPageLoadPlatformAdapter;
}

/**
 * Per-`configKey` registry of page-load timers, scoped to a single
 * `SduiServices` instance. Detached request timers are not retained.
 */
export interface SduiLoadTimerRegistry {
  reset(configKey: string, options?: ResetLoadTimerOptions): SduiLoadTimer;
  /** Creates a request timer without replacing the page timer read by the paint hook. */
  createDetached(configKey: string, options?: ResetLoadTimerOptions): SduiLoadTimer;
  get(configKey: string): SduiLoadTimer | undefined;
  clear(configKey?: string): void;
}

export function createSduiLoadTimerRegistry(
  errorReporter?: SduiErrorReporter,
  options?: CreateSduiLoadTimerRegistryOptions,
): SduiLoadTimerRegistry {
  const timers = new Map<string, SduiLoadTimer>();
  const { analyticsReporter, observeWebVitals, pageLoadPlatformAdapter } = options ?? {};

  function disposeTimer(configKey: string): void {
    timers.get(configKey)?.dispose();
    timers.delete(configKey);
  }

  function createTimer(configKey: string, resetOptions?: ResetLoadTimerOptions): SduiLoadTimer {
    return createSduiLoadTimer(configKey, {
      pageContext: resetOptions?.pageContext,
      errorReporter,
      analyticsReporter,
      observeWebVitals,
      pageLoadPlatformAdapter,
    });
  }

  return {
    reset(configKey, resetOptions) {
      disposeTimer(configKey);
      const timer = createTimer(configKey, resetOptions);
      timers.set(configKey, timer);
      return timer;
    },

    createDetached(configKey, resetOptions) {
      return createTimer(configKey, resetOptions);
    },

    get(configKey) {
      return timers.get(configKey);
    },

    clear(configKey) {
      if (configKey) {
        disposeTimer(configKey);
        return;
      }
      for (const timer of timers.values()) {
        timer.dispose();
      }
      timers.clear();
    },
  };
}
