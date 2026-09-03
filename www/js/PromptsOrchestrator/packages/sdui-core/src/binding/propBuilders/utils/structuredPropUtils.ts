import {
  createSduiListValue,
  createSduiRecordValue,
  type SduiListValue,
  type SduiRecordValue,
} from "../../propValues";
import type { PropBuildRequest, ResolvedProp } from "../../../types";
import { DataStatus } from "../../../types";
import { childCtx } from "./bindingContext";
import type { StatusCollector } from "./sduiPropSignalUtils";

function normalizeFieldName(fieldName: string): string {
  return fieldName.replace(/_([a-z0-9])/g, (_match, character: string) => character.toUpperCase());
}

function readResolvedProp(result: ResolvedProp, statuses: StatusCollector): unknown {
  if (result.category === "propSignal") {
    statuses.push(result.statusSignal?.value ?? DataStatus.Ready);
    return result.signal.value;
  }
  if (result.category === "failed") {
    statuses.push(DataStatus.Failed);
    return undefined;
  }
  return result.value;
}

export function resolveStructuredPropRecord(
  definition: Record<string, unknown>,
  request: PropBuildRequest,
  statuses: StatusCollector,
): SduiRecordValue {
  const fields: Record<string, unknown> = {};
  for (const [rawFieldName, rawField] of Object.entries(definition)) {
    if (rawFieldName.startsWith("$")) continue;

    const fieldName = normalizeFieldName(rawFieldName);
    const result = request.buildProp(rawField, childCtx(request.ctx, `.${fieldName}`));
    fields[fieldName] = readResolvedProp(result, statuses);
  }
  return createSduiRecordValue(fields);
}

export function resolveRepeatedPropList(
  definitions: readonly unknown[],
  request: PropBuildRequest,
  statuses: StatusCollector,
): SduiListValue {
  const items = definitions.map((definition, index) => {
    const result = request.buildProp(definition, childCtx(request.ctx, `[${index}]`));
    return readResolvedProp(result, statuses);
  });
  return createSduiListValue(items);
}
