import { createFireTelemetryCounter as createFireTelemetryCounterV2 } from "./v2/fireTelemetryCounter";
import type { Attributes } from "./types";

export type CreateFireTelemetryCounterOptions = {
  batchSize?: number;
  batchIntervalMs?: number;
  maxRetryAttempts?: number;
  onError?: (error: string, context: { name: string; attributes?: Attributes }) => void;
};

/**
 * @deprecated Use `createFireTelemetryCounter` from `@rbx/web-telemetry/v2/fire` instead.
 * This entry re-exports that implementation so existing imports keep working.
 */
export const createFireTelemetryCounter = createFireTelemetryCounterV2;

export type { Attributes, FireTelemetryCounterFn } from "./types";
