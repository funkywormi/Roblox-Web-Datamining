import { create } from "@bufbuild/protobuf";
import {
  EngineTelemetryAttributesSchema,
  type EngineTelemetryAttributes,
} from "@rbx/event-stream-proto/eventstream/enginetelemetry/engine_telemetry_attributes_pb";

import type { Attributes } from "./types";

const INT32_MIN = -(2 ** 31);
const INT32_MAX = 2 ** 31 - 1;

function fitsInt32(value: number): boolean {
  return Number.isInteger(value) && value >= INT32_MIN && value <= INT32_MAX;
}

export function toEngineTelemetryAttributes(attrs: Attributes): EngineTelemetryAttributes {
  const stringAttributes: Record<string, string> = {};
  const boolAttributes: Record<string, boolean> = {};
  const int32Attributes: Record<string, number> = {};
  const int64Attributes: Record<string, bigint> = {};
  const doubleAttributes: Record<string, number> = {};

  for (const [key, value] of Object.entries(attrs)) {
    if (typeof value === "string") {
      stringAttributes[key] = value;
    } else if (typeof value === "boolean") {
      boolAttributes[key] = value;
    } else if (typeof value === "bigint") {
      int64Attributes[key] = value;
    } else if (typeof value === "number") {
      if (!Number.isFinite(value)) {
        stringAttributes[key] = String(value);
      } else if (fitsInt32(value)) {
        int32Attributes[key] = value;
      } else if (Number.isInteger(value)) {
        int64Attributes[key] = BigInt(value);
      } else {
        doubleAttributes[key] = value;
      }
    }
  }

  return create(EngineTelemetryAttributesSchema, {
    stringAttributes,
    boolAttributes,
    int32Attributes,
    int64Attributes,
    doubleAttributes,
  });
}
