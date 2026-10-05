/**
 * Builder for `FoundationIconConfigProp` — the canonical SDUI icon wire shape
 * (`{ name, variant? }`, Foundation `IconName` + `IconVariant` tokens).
 *
 * Resolves the nested `name` / `variant` fields with the shared structured-prop
 * resolver (`resolveStructuredPropRecord`, so each may be a literal or binding
 * path), then maps the pair once to the allowlisted Tailwind class Foundation UI
 * needs (e.g. Star + Filled → `icon-filled-star`). The resolved prop value is
 * that class string, not a structured record.
 */
import { reportBindingError, SduiErrorName } from "../../errors";
import { foundationIconConfigToClass } from "../../foundation/sduiFoundationIcons";
import type { PropBuilder, PropBuildOptions, PropBuildRequest, ResolvedProp } from "../../types";
import { isBindingPathKind, PROP_KIND } from "../../types/propKinds";
import { isRecord } from "../../utils/typeGuards";
import {
  generateConditionalPropValue,
  generateDynamicBindingPropValue,
  generateStructuredPropSignalValue,
} from "./utils/sduiPropSignalUtils";
import { resolveStructuredPropRecord } from "./utils/structuredPropUtils";

export const buildFoundationIconConfigProp: PropBuilder = (
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
      buildFoundationIconConfigProp,
      options,
    );
  }

  if (isBindingPathKind(propType)) {
    // Whole config bound to a hydration `{ name, variant }` object.
    if (typeof propValue !== "string") {
      reportBindingError(
        SduiErrorName.InvalidBindingPath,
        ctx,
        `FoundationIconConfigProp received non-string binding path: ${typeof propValue}`,
      );
      return { value: undefined, category: "failed", error: "Invalid binding path" };
    }
    return generateDynamicBindingPropValue(propValue, childRequest, (raw, parserCtx) =>
      foundationIconConfigToClass(raw, parserCtx),
    );
  }

  if (propType !== PROP_KIND.LITERAL) {
    reportBindingError(
      SduiErrorName.UnknownPropKind,
      ctx,
      `FoundationIconConfigProp got unsupported propType="${propType}"`,
    );
    return { value: undefined, category: "failed", error: `Unknown prop kind: ${propType}` };
  }

  if (!isRecord(propValue)) {
    reportBindingError(
      SduiErrorName.FailedToParseProp,
      ctx,
      `FoundationIconConfigProp literal must be an object; got ${typeof propValue}`,
    );
    return { value: undefined, category: "failed", error: "Invalid FoundationIconConfig literal" };
  }

  return generateStructuredPropSignalValue(childRequest, "FoundationIconConfigProp", statuses => {
    const config = resolveStructuredPropRecord(propValue, childRequest, statuses);
    return foundationIconConfigToClass(config, childRequest.ctx);
  });
};
