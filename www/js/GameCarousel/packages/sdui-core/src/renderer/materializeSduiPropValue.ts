import type React from "react";

import {
  isSduiActionValue,
  isSduiListValue,
  isSduiRecordValue,
  type SduiActionValue,
} from "../binding/propValues";
import { SduiErrorName } from "../errors/SduiErrors";
import { reportError } from "../errors/SduiLogger";
import type {
  SduiActionResolver,
  SduiActionSnapshot,
  SduiComponentConfig,
  SduiErrorReporter,
  SduiPageContext,
} from "../types";
import { DataStatus } from "../types";
import { componentTypeName } from "../utils/protoEnum";
import { isUnresolvedTemplateData } from "../utils/rendererHelpers";
import { isSduiConfig, isSduiConfigArray } from "../utils/typeGuards";

export interface MaterializeSduiPropValueOptions {
  actionResolver?: SduiActionResolver;
  renderConfig: (
    config: SduiComponentConfig,
    reactKey: React.Key | undefined,
  ) => React.ReactElement;
  errorReporter: SduiErrorReporter;
  pageContext: SduiPageContext;
  componentType: SduiComponentConfig["componentType"];
}

export type MaterializeSduiPropValueResult =
  | { kind: "value"; value: unknown; complete: boolean }
  | { kind: "omitted" };

function reportMissingActionResolver(path: string, options: MaterializeSduiPropValueOptions): void {
  reportError(
    SduiErrorName.MissingActionResolver,
    `SduiRenderer encountered action data at "${path}" but no actionResolver was provided`,
    options.pageContext,
    { componentType: componentTypeName(options.componentType), propName: path },
    options.errorReporter,
  );
}

function reportUnresolvedValue(
  value: Record<string, unknown>,
  path: string,
  options: MaterializeSduiPropValueOptions,
): void {
  const rawTypeName = value.$typeName;
  const typeName = typeof rawTypeName === "string" ? rawTypeName : "unknown";
  reportError(
    SduiErrorName.UnresolvedPropValue,
    `SduiRenderer encountered an unresolved proto prop wrapper (${typeName}) at "${path}"`,
    options.pageContext,
    { componentType: componentTypeName(options.componentType), propName: path },
    options.errorReporter,
  );
}

function materializeActionValue(
  actionValue: SduiActionValue,
  path: string,
  options: MaterializeSduiPropValueOptions,
): MaterializeSduiPropValueResult {
  if (!options.actionResolver) {
    reportMissingActionResolver(path, options);
    return { kind: "omitted" };
  }

  const materializeActionParams = (
    params: Record<string, unknown>,
  ): { actionParams: Record<string, unknown>; complete: boolean } => {
    let complete = true;
    const materializedParams: Record<string, unknown> = {};
    for (const [paramName, paramValue] of Object.entries(params)) {
      // eslint-disable-next-line @typescript-eslint/no-use-before-define -- action params recurse through the same materializer
      const result = materializeSduiPropValue(paramValue, `${path}.params.${paramName}`, options);
      if (result.kind === "value") {
        materializedParams[paramName] = result.value;
        complete = complete && result.complete;
      } else {
        complete = false;
      }
    }
    return { actionParams: materializedParams, complete };
  };

  let snapshot: SduiActionSnapshot;
  if (actionValue.status !== DataStatus.Ready) {
    snapshot = { status: actionValue.status };
  } else {
    const materialized = materializeActionParams(actionValue.actionData.actionParams);
    if (!materialized.complete) {
      snapshot = { status: DataStatus.Failed };
    } else {
      snapshot = {
        status: DataStatus.Ready,
        actionData: {
          ...actionValue.actionData,
          actionParams: materialized.actionParams,
        },
      };
    }
  }

  return {
    kind: "value",
    value: options.actionResolver(snapshot),
    complete: true,
  };
}

export function materializeSduiPropValue(
  value: unknown,
  path: string,
  options: MaterializeSduiPropValueOptions,
): MaterializeSduiPropValueResult {
  if (isSduiActionValue(value)) {
    return materializeActionValue(value, path, options);
  }

  if (isSduiRecordValue(value)) {
    let complete = true;
    const record: Record<string, unknown> = {};
    for (const [fieldName, fieldValue] of Object.entries(value)) {
      if (fieldName === "__sduiKind") continue;
      const result = materializeSduiPropValue(fieldValue, `${path}.${fieldName}`, options);
      if (result.kind === "value") {
        record[fieldName] = result.value;
        complete = complete && result.complete;
      } else {
        complete = false;
      }
    }
    return { kind: "value", value: record, complete };
  }

  if (isSduiListValue(value)) {
    let complete = true;
    const list: unknown[] = [];
    value.forEach((item, index) => {
      const itemPath = `${path}[${index}]`;
      const result = materializeSduiPropValue(item, itemPath, options);
      if (result.kind === "value") {
        list.push(result.value);
        complete = complete && result.complete;
      } else {
        complete = false;
      }
    });
    return { kind: "value", value: list, complete };
  }

  if (isSduiConfigArray(value)) {
    return {
      kind: "value",
      value: value.map((config, index) =>
        options.renderConfig(config, config.reactKey ?? config.identifier ?? `${path}[${index}]`),
      ),
      complete: true,
    };
  }

  if (isSduiConfig(value)) {
    return {
      kind: "value",
      value: options.renderConfig(value, value.reactKey ?? value.identifier ?? path),
      complete: true,
    };
  }

  if (isUnresolvedTemplateData(value)) {
    reportUnresolvedValue(value, path, options);
    return { kind: "omitted" };
  }

  return { kind: "value", value, complete: true };
}
