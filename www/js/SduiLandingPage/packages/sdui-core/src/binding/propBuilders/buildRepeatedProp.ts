import { reportBindingError, SduiErrorName } from "../../errors";
import { createSduiListValue } from "../propValues";
import type { PropBuilder, PropBuildOptions, PropBuildRequest, ResolvedProp } from "../../types";
import { DataStatus } from "../../types";
import { isBindingPathKind, PROP_KIND } from "../../types/propKinds";
import { isRecord } from "../../utils/typeGuards";
import {
  generateConditionalPropValue,
  generateStructuredBindingPropValue,
  generateStructuredPropSignalValue,
  type StatusCollector,
} from "./utils/sduiPropSignalUtils";
import { resolveRepeatedPropList } from "./utils/structuredPropUtils";

function resolveArray(
  value: unknown,
  request: PropBuildRequest,
  statuses: StatusCollector,
): ReturnType<typeof createSduiListValue> {
  if (!Array.isArray(value)) {
    reportBindingError(
      SduiErrorName.RepeatedBindingNotArray,
      request.ctx,
      `repeated prop binding expected an array; got ${value === null ? "null" : typeof value}`,
    );
    statuses.push(DataStatus.Failed);
    return createSduiListValue([]);
  }
  return resolveRepeatedPropList(value, request, statuses);
}

/**
 * Builds repeated schema-defined message props. Literal values use a wrapper
 * message with an `array` field; every entry is recursively dispatched and
 * the result is branded for render-time materialization.
 */
export const buildRepeatedProp: PropBuilder = (
  propType,
  propValue,
  request,
  options: PropBuildOptions = { kind: "none" },
): ResolvedProp => {
  const ctx = { ...request.ctx, parserName: propType };
  const childRequest: PropBuildRequest = { ...request, ctx };

  if (propType === PROP_KIND.CONDITIONAL) {
    const conditionalBody = isRecord(propValue) ? propValue : {};
    return generateConditionalPropValue(conditionalBody, childRequest, buildRepeatedProp, options);
  }

  if (isBindingPathKind(propType)) {
    if (typeof propValue !== "string") {
      reportBindingError(
        SduiErrorName.InvalidBindingPath,
        ctx,
        `repeated prop received non-string binding path: ${typeof propValue}`,
      );
      return { value: undefined, category: "failed", error: "Invalid binding path" };
    }
    return generateStructuredBindingPropValue(
      propValue,
      childRequest,
      "repeated prop",
      (value, statuses) => resolveArray(value, childRequest, statuses),
    );
  }

  if (propType === PROP_KIND.ARRAY_MAP || propType === PROP_KIND.ARRAY_MAP_SNAKE) {
    // TODO: Implement array_map support
    reportBindingError(
      SduiErrorName.UnknownRepeatedPropVariant,
      ctx,
      "repeated prop array_map is not supported on web",
    );
    return { value: undefined, category: "failed", error: "Unsupported repeated prop array_map" };
  }

  if (propType !== PROP_KIND.LITERAL) {
    reportBindingError(
      SduiErrorName.UnknownRepeatedPropVariant,
      ctx,
      `repeated prop got unknown propType="${propType}"`,
    );
    return {
      value: undefined,
      category: "failed",
      error: `Unknown repeated prop kind: ${propType}`,
    };
  }

  // Note: Assumes that the key on the protobuf message is "array" for a
  // repeated prop. This is a valid assumption today, if another repeated prop
  // uses a different key, we will need to update this or provide a separate builder.
  const arrayDefinition = isRecord(propValue) ? propValue.array : undefined;
  if (!Array.isArray(arrayDefinition)) {
    reportBindingError(
      SduiErrorName.InvalidRepeatedLiteralShape,
      ctx,
      "repeated prop literal must be a wrapper object with an array field",
    );
    return { value: undefined, category: "failed", error: "Invalid repeated literal" };
  }

  return generateStructuredPropSignalValue(childRequest, "repeated prop", statuses =>
    resolveRepeatedPropList(arrayDefinition, childRequest, statuses),
  );
};
