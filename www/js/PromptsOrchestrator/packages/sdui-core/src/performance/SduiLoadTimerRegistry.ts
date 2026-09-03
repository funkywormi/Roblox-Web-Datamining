import type { SduiPageContext } from "../types/analytics";
import type { SduiErrorReporter } from "../types/error";
import type { SduiLoadTimer } from "../types/performance";
import { createSduiLoadTimer } from "./SduiLoadTimer";

export interface ResetLoadTimerOptions {
  pageContext?: SduiPageContext;
}

/**
 * Per-`configKey` registry of `SduiLoadTimer` instances, scoped to a single
 * `SduiServices` instance.
 */
export interface SduiLoadTimerRegistry {
  reset(configKey: string, options?: ResetLoadTimerOptions): SduiLoadTimer;
  get(configKey: string): SduiLoadTimer | undefined;
  clear(configKey?: string): void;
}

export function createSduiLoadTimerRegistry(
  errorReporter?: SduiErrorReporter,
): SduiLoadTimerRegistry {
  const timers = new Map<string, SduiLoadTimer>();

  return {
    reset(configKey, options) {
      const timer = createSduiLoadTimer(configKey, {
        pageContext: options?.pageContext,
        errorReporter,
      });
      timers.set(configKey, timer);
      return timer;
    },

    get(configKey) {
      return timers.get(configKey);
    },

    clear(configKey) {
      if (configKey) {
        timers.delete(configKey);
        return;
      }
      timers.clear();
    },
  };
}
