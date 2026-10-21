// eslint-disable-next-line @typescript-eslint/no-restricted-imports
import { fromJson as bufFromJson, fromJsonString as bufFromJsonString } from "@bufbuild/protobuf";
import type { DescMessage, JsonReadOptions, JsonValue, MessageShape } from "@bufbuild/protobuf";

// ignoreUnknownFields is always forced to true — callers cannot override it.
type ParseOptions = Omit<JsonReadOptions, "ignoreUnknownFields">;

// Wrappers that force ignoreUnknownFields to true for proto forward/backward compatibility.
// Direct use of @bufbuild/protobuf's fromJson/fromJsonString is banned via ESLint.
export function fromJson<Desc extends DescMessage>(
  schema: Desc,
  json: JsonValue,
  options?: Partial<ParseOptions>,
): MessageShape<Desc> {
  return bufFromJson(schema, json, { ...options, ignoreUnknownFields: true });
}

export function fromJsonString<Desc extends DescMessage>(
  schema: Desc,
  json: string,
  options?: Partial<ParseOptions>,
): MessageShape<Desc> {
  return bufFromJsonString(schema, json, { ...options, ignoreUnknownFields: true });
}
