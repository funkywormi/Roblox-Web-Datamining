// TODO: parity with lua — lazyHandler support (see getSduiImpressionHandlerRegistry.lua).
import type { SduiImpressionEventName, SduiImpressionHandlerConfig } from "../types";
import { createBaseRegistry } from "./createBaseRegistry";

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
  lock(): void;
  isLocked(): boolean;
}

export type ImpressionHandlerConfigsInput = Partial<
  Record<SduiImpressionEventName, SduiImpressionHandlerConfig>
> &
  Record<string, SduiImpressionHandlerConfig | undefined>;

/** Returns a fresh registry per call so each `SduiServices` owns its own map. */
export function createSduiImpressionHandlerRegistry(): SduiImpressionHandlerRegistry {
  const registry = createBaseRegistry<string, SduiImpressionHandlerConfig>({
    lockedMessage: "SDUI impression handler registry is locked",
    parseKey: rawKey => rawKey,
  });

  return {
    registerImpressionHandler(name, config) {
      registry.register(name, config);
    },
    registerImpressionHandlers(configs) {
      registry.registerAll(configs);
    },
    getImpressionHandler(name) {
      return registry.get(name);
    },
    hasImpressionHandler(name) {
      return registry.has(name);
    },
    lock() {
      registry.lock();
    },
    isLocked() {
      return registry.isLocked();
    },
  };
}
