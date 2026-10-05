/**
 * Shared helpers for normalizing the output of bufbuild's enum encoders into
 * plain strings safe to use as analytics dimensions, telemetry params, etc.
 */

import { enumToJson, type DescEnum } from "@bufbuild/protobuf";
import {
  type ActionType,
  ActionTypeSchema,
} from "@rbx/service-contracts-proto/roblox/apppageplatform/shared/v1beta1/actions_pb";
import { UiComponentType } from "@rbx/service-contracts-proto/roblox/apppageplatform/shared/v1beta1/ui_component_type_pb";
import { stripEnumPrefix } from "./enumPrefix";

export function jsonEnumToString(json: unknown): string {
  if (typeof json === "string") return json;
  if (typeof json === "number" || typeof json === "boolean") return String(json);
  return JSON.stringify(json);
}

/**
 * Reverse-maps a numeric proto enum value to its proto-JSON name string (e.g.
 * `2` → `"TEXT_TRUNCATE_AT_END"`)
 */
export function enumNumberToName(schema: DescEnum, value: unknown): string | undefined {
  if (typeof value !== "number") return undefined;
  try {
    return enumToJson(schema, value) ?? undefined;
  } catch {
    return undefined;
  }
}

/**
 * Reverse-lookup the TS enum key for a `UiComponentType` value, for log
 * readability (e.g. `100` → `"TILE"`). Falls back to the numeric string for
 * unknown values.
 */
export function componentTypeName(type: UiComponentType): string {
  const name = UiComponentType[type];

  if (typeof name === "string") {
    return name;
  }
  return String(type);
}

/**
 * Converts a proto action enum name to PascalCase (e.g. `"ACTION_TYPE_LINK"` →
 * `"Link"`, `"ACTION_TYPE_OPEN_GAME_DETAILS"` → `"OpenGameDetails"`).
 */
export function protoActionTypeToPascalCase(protoName: string): string {
  return stripEnumPrefix(protoName, "ACTION_TYPE_", true);
}

/**
 * Reverse-maps an `ActionType` value to its PascalCase name (e.g. `2` →
 * `"Link"`). Falls back to the numeric string for unknown values.
 */
export function actionTypeName(type: ActionType): string {
  return protoActionTypeToPascalCase(enumNumberToName(ActionTypeSchema, type) ?? String(type));
}
