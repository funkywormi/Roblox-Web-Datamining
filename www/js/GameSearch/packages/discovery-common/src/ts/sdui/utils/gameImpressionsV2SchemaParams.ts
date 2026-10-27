import { getOption } from "@bufbuild/protobuf";
import { json } from "@rbx/event-stream-proto/event/event_field_options_pb";
import { GameImpressionsV2EventSchema } from "@rbx/event-stream-proto/eventstream/webfrontend/game_impressions_event_v2_pb";

/**
 * Transport parameter names declared by `GameImpressionsV2Event` via
 * `(event.json).parameter_name`. Derived once from the generated schema so
 * aliases stay in sync (e.g. `sort_id` → `gameSetTypeId`).
 */
export const GAME_IMPRESSIONS_V2_PARAMETER_NAMES: ReadonlySet<string> = new Set(
  GameImpressionsV2EventSchema.fields
    .map(field => getOption(field, json)?.parameterName)
    .filter((name): name is string => typeof name === "string" && name.length > 0),
);

/**
 * Keeps only keys that `GameImpressionsV2Event` can parse. Broad SDUI analytics
 * context may contain many more fields; they must not reach the event transport.
 */
export const filterGameImpressionsToV2Schema = <T extends Record<string, unknown>>(
  params: T,
): Partial<T> => {
  const filtered: Record<string, unknown> = {};

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && GAME_IMPRESSIONS_V2_PARAMETER_NAMES.has(key)) {
      filtered[key] = value;
    }
  });

  return filtered as Partial<T>;
};
