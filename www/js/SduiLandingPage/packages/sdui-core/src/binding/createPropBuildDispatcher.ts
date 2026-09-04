import type { ReadonlySignal } from "@preact/signals-core";

import { SduiErrorName } from "../errors/SduiErrors";
import { reportError } from "../errors/SduiLogger";
import type {
  BuildPropContext,
  DataBindingSources,
  PropBuildRequest,
  SduiDataBinder,
} from "../types";
import { isRecord } from "../utils/typeGuards";
import { unwrapOneOf, unwrapOneofPropWrapper } from "../utils/oneOfHelper";
import { extractDescriptorName, getPropBuilder, resolveDescriptorName } from "./propBuilders";
import { selectPropBuildOptions } from "./propBuilders/utils/selectPropBuildOptions";

interface PropBuildDispatcherDeps {
  dataSources: ReadonlySignal<DataBindingSources>;
  dataBinder: SduiDataBinder;
  buildContext?: BuildPropContext;
}

/**
 * Creates the canonical recursive prop dispatcher used by production and tests.
 * The returned closure preserves one component's data/build context while each
 * descent supplies its own telemetry path via `ctx`.
 */
export function createPropBuildDispatcher(
  deps: PropBuildDispatcherDeps,
): PropBuildRequest["buildProp"] {
  const { dataSources, dataBinder, buildContext } = deps;

  const buildProp: PropBuildRequest["buildProp"] = (rawProp, ctx) => {
    if (!isRecord(rawProp)) {
      return { value: undefined, category: "failed", error: "Invalid prop definition" };
    }

    const innerProp = unwrapOneofPropWrapper(rawProp);
    if (innerProp !== undefined) {
      return buildProp(innerProp, ctx);
    }

    const extractedDescriptorName = extractDescriptorName(rawProp);
    const descriptorName = resolveDescriptorName(extractedDescriptorName);
    if (extractedDescriptorName === undefined) {
      const rawTypeName = typeof rawProp.$typeName === "string" ? rawProp.$typeName : undefined;
      reportError(
        SduiErrorName.FailedToParseProp,
        `prop missing or malformed $typeName (${rawTypeName ?? "absent"}), falling back to default builder`,
        ctx.pageContext,
        { componentType: ctx.componentType, propName: ctx.propName, parserName: rawTypeName },
        ctx.errorReporter,
      );
    }

    const unwrappedKind = unwrapOneOf(rawProp);
    if (!unwrappedKind) {
      return {
        value: undefined,
        category: "failed",
        error: "Prop has no `kind` oneOf wrapper",
      };
    }

    const request: PropBuildRequest = {
      dataSources,
      dataBinder,
      ctx,
      buildProp,
    };
    return getPropBuilder(descriptorName)(
      unwrappedKind.propType,
      unwrappedKind.propValue,
      request,
      selectPropBuildOptions(descriptorName, buildContext),
    );
  };

  return buildProp;
}
