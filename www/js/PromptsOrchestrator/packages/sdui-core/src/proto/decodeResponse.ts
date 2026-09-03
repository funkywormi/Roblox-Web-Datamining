import { fromBinary } from "@bufbuild/protobuf";
import type { DescMessage, JsonValue } from "@bufbuild/protobuf";
import { fromJson } from "@rbx/core-lib/proto";
import type { ApiRequestConfig, SduiApiResponse } from "../types";
import { isJsonValue } from "../utils/typeGuards";
import { convertDecodedMessage } from "./convertDecodedMessage";

/**
 * Decodes a binary protobuf payload into the internal {@link SduiApiResponse}.
 */
export function decodeProtobufResponse(schema: DescMessage, bytes: Uint8Array): SduiApiResponse {
  return convertDecodedMessage(fromBinary(schema, bytes, { readUnknownFields: false }));
}

/**
 * Decodes a proto-JSON payload (already parsed to a {@link JsonValue}) into
 * the internal {@link SduiApiResponse}, using the same converter as
 * {@link decodeProtobufResponse} so output is identical regardless of wire
 * format.
 */
export function decodeJsonWithSchema(schema: DescMessage, json: JsonValue): SduiApiResponse {
  return convertDecodedMessage(fromJson(schema, json));
}

function throwIfAborted(signal?: AbortSignal): void {
  if (!signal?.aborted) return;
  throw signal.reason ?? new DOMException("The operation was aborted", "AbortError");
}

/**
 * Reads a {@link Response} body once and returns a normalized
 * {@link SduiApiResponse}.
 *
 * Wire format is selected solely from the caller-declared
 * {@link ApiRequestConfig.responseFormat}.
 * Defaults to `"protobuf"` when `responseFormat` is omitted
 */
export async function decodeSduiFetchResponse(
  res: Response,
  requestConfig: Pick<ApiRequestConfig, "protoSchema" | "responseFormat">,
  signal?: AbortSignal,
): Promise<SduiApiResponse> {
  const { protoSchema, responseFormat = "protobuf" } = requestConfig;

  if (!protoSchema) {
    throw new Error("SDUI decode: protoSchema is required to decode API responses.");
  }
  throwIfAborted(signal);

  if (responseFormat === "protobuf") {
    const buffer = await res.arrayBuffer();
    throwIfAborted(signal);
    const decoded = decodeProtobufResponse(protoSchema, new Uint8Array(buffer));
    throwIfAborted(signal);
    return decoded;
  }

  const json: unknown = await res.json();
  throwIfAborted(signal);
  if (!isJsonValue(json)) {
    throw new Error("SDUI decode: response body parsed to undefined");
  }
  const decoded = decodeJsonWithSchema(protoSchema, json);
  throwIfAborted(signal);
  return decoded;
}
