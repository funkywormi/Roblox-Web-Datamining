import type { SduiActionTelemetryHandler } from "../types";
import { createBaseRegistry } from "./createBaseRegistry";

export type TelemetryHandlersInput = Record<string, SduiActionTelemetryHandler>;
/**
 * Registry of telemetry handlers keyed by `Action.telemetry_handler`. A hit
 * in `logActionTelemetry` overrides `SduiActionHandlerConfig.telemetryHandler`
 * and the default itemAction event (subject to `firesOwnTelemetry`).
 */
export interface SduiTelemetryHandlerNameRegistry {
  registerTelemetryHandler(name: string, handler: SduiActionTelemetryHandler): void;
  registerTelemetryHandlers(handlers: TelemetryHandlersInput): void;
  getTelemetryHandler(name: string): SduiActionTelemetryHandler | undefined;
  hasTelemetryHandler(name: string): boolean;
  lock(): void;
  isLocked(): boolean;
}

/** Returns a fresh registry per call so each `SduiServices` owns its own map. */
export function createSduiTelemetryHandlerNameRegistry(): SduiTelemetryHandlerNameRegistry {
  const registry = createBaseRegistry<string, SduiActionTelemetryHandler>({
    lockedMessage: "SDUI telemetry handler registry is locked",
    parseKey: rawKey => rawKey,
  });

  return {
    registerTelemetryHandler(name, handler) {
      registry.register(name, handler);
    },
    registerTelemetryHandlers(handlers) {
      registry.registerAll(handlers);
    },
    getTelemetryHandler(name) {
      return registry.get(name);
    },
    hasTelemetryHandler(name) {
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
