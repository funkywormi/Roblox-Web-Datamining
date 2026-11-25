import { reportBindingError, SduiErrorName } from "../../errors";
import { createSduiRecordValue } from "../propValues";
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
import { resolveStructuredPropRecord } from "./utils/structuredPropUtils";

function resolveRecord(
  value: unknown,
  request: PropBuildRequest,
  statuses: StatusCollector,
): ReturnType<typeof createSduiRecordValue> {
  if (!isRecord(value)) {
    reportBindingError(
      SduiErrorName.InvalidStructuredPropShape,
      request.ctx,
      `structured prop expected an object; got ${Array.isArray(value) ? "array" : typeof value}`,
    );
    statuses.push(DataStatus.Failed);
    return createSduiRecordValue({});
  }
  return resolveStructuredPropRecord(value, request, statuses);
}

/**
 * Builds schema-defined message props whose fields are themselves SDUI prop
 * descriptors. The resulting record is branded so render-time materialization
 * can safely recurse into nested actions and component configs.
 */
export const buildStructuredProp: PropBuilder = (
  propType,
  propValue,
  request,
  options: PropBuildOptions = { kind: "none" },
): ResolvedProp => {
  const ctx = { ...request.ctx, parserName: propType };
  const childRequest: PropBuildRequest = { ...request, ctx };

  if (propType === PROP_KIND.CONDITIONAL) {
    const conditionalBody = isRecord(propValue) ? propValue : {};
    return generateConditionalPropValue(
      conditionalBody,
      childRequest,
      buildStructuredProp,
      options,
    );
  }

  if (isBindingPathKind(propType)) {
    if (typeof propValue !== "string") {
      reportBindingError(
        SduiErrorName.InvalidBindingPath,
        ctx,
        `structured prop received non-string binding path: ${typeof propValue}`,
      );
      return { value: undefined, category: "failed", error: "Invalid binding path" };
    }
    return generateStructuredBindingPropValue(
      propValue,
      childRequest,
      "structured prop",
      (value, statuses) => resolveRecord(value, childRequest, statuses),
    );
  }

  if (propType !== PROP_KIND.LITERAL) {
    reportBindingError(
      SduiErrorName.UnknownPropKind,
      ctx,
      `structured prop got unknown propType="${propType}"`,
    );
    return { value: undefined, category: "failed", error: `Unknown prop kind: ${propType}` };
  }

  if (!isRecord(propValue)) {
    reportBindingError(
      SduiErrorName.InvalidStructuredPropShape,
      ctx,
      `structured prop literal must be an object; got ${
        Array.isArray(propValue) ? "array" : typeof propValue
      }`,
    );
    return { value: undefined, category: "failed", error: "Invalid structured literal" };
  }

  return generateStructuredPropSignalValue(childRequest, "structured prop", statuses =>
    resolveStructuredPropRecord(propValue, childRequest, statuses),
  );
};
