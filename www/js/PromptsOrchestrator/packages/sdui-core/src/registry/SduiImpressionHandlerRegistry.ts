// TODO: parity with lua — lazyHandler support (see getSduiImpressionHandlerRegistry.lua).
import type { SduiImpressionEventName, SduiImpressionHandlerConfig } from "../types";

type ImpressionEventNameInput = SduiImpressionEventName | (string & {});

/**
 * Per-`SduiServices` registry of impression handlers keyed by the proto
 * `impression_event_name` on collection components. Unknown names are not a
 * client error — `reportImpressions` fires the default-shape payload under that
 * name, and still dual-writes generic `itemImpressions` unless
 * `skipItemImpressionsLog` suppresses it (lua parity).
 */
export interface SduiImpressionHandlerRegistry {
  registerImpressionHandler(
    name: ImpressionEventNameInput,
    config: SduiImpressionHandlerConfig,
  ): void;
  registerImpressionHandlers(configs: ImpressionHandlerConfigsInput): void;
  getImpressionHandler(name: ImpressionEventNameInput): SduiImpressionHandlerConfig | undefined;
  hasImpressionHandler(name: ImpressionEventNameInput): boolean;
}

type ImpressionHandlerConfigsInput = Partial<
  Record<SduiImpressionEventName, SduiImpressionHandlerConfig>
> &
  Record<string, SduiImpressionHandlerConfig | undefined>;

/** Returns a fresh registry per call so each `SduiServices` owns its own map. */
export function createSduiImpressionHandlerRegistry(): SduiImpressionHandlerRegistry {
  const handlers = new Map<string, SduiImpressionHandlerConfig>();

  return {
    registerImpressionHandler(name, config) {
      handlers.set(name, config);
    },

    registerImpressionHandlers(configs) {
      for (const [name, config] of Object.entries(configs)) {
        if (config) {
          handlers.set(name, config);
        }
      }
    },

    getImpressionHandler(name) {
      return handlers.get(name);
    },

    hasImpressionHandler(name) {
      return handlers.has(name);
    },
  };
}
