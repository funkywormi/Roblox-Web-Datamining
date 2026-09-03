import type { SduiActionTelemetryHandler } from "../types";

/**
 * Registry of telemetry handlers keyed by `Action.telemetry_handler`. A hit
 * in `logActionTelemetry` overrides `SduiActionHandlerConfig.telemetryHandler`
 * and the default itemAction event (subject to `firesOwnTelemetry`).
 */
export interface SduiTelemetryHandlerNameRegistry {
  registerTelemetryHandler(name: string, handler: SduiActionTelemetryHandler): void;
  registerTelemetryHandlers(handlers: Record<string, SduiActionTelemetryHandler>): void;
  getTelemetryHandler(name: string): SduiActionTelemetryHandler | undefined;
  hasTelemetryHandler(name: string): boolean;
}

/** Returns a fresh registry per call so each `SduiServices` owns its own map. */
export function createSduiTelemetryHandlerNameRegistry(): SduiTelemetryHandlerNameRegistry {
  const handlers = new Map<string, SduiActionTelemetryHandler>();

  return {
    registerTelemetryHandler(name, handler) {
      handlers.set(name, handler);
    },

    registerTelemetryHandlers(configs) {
      for (const [name, handler] of Object.entries(configs)) {
        handlers.set(name, handler);
      }
    },

    getTelemetryHandler(name) {
      return handlers.get(name);
    },

    hasTelemetryHandler(name) {
      return handlers.has(name);
    },
  };
}
