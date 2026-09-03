import { enumFromJson } from "@bufbuild/protobuf";
import { computed } from "@preact/signals-core";
import { reportBindingError, SduiErrorName } from "../../errors";
import { asShallowEqualValue, computedEqual, shallowEqual } from "../../signals/computedEqual";
import type {
  ActionBuildContext,
  BindingContext,
  PropBuildOptions,
  PropBuildRequest,
  ResolvedProp,
  SduiActionData,
} from "../../types";
import { ActionType, ActionTypeSchema, DataStatus } from "../../types";
import { unwrapOneOf } from "../../utils/oneOfHelper";
import { isRecord } from "../../utils/typeGuards";
import {
  createSduiActionValue,
  createSduiListValue,
  isSduiListValue,
  type SduiActionValue,
} from "../propValues";
import { aggregateStatus, generateConditionalPropValue } from "./utils/sduiPropSignalUtils";
import { PROP_KIND } from "../../types/propKinds";
import { extractDescriptorName } from "./resolveDescriptorName";

interface ExtractedActionBody {
  actionType: unknown;
  actionParams: unknown;
  telemetryHandler: unknown;
  actionEventName: unknown;
}

/**
 * Extracts `actionType`, `actionParams`, `telemetryHandler`, and
 * `actionEventName` from an `Action` proto message. Wire shape after
 * `normalizeProtoValue`:
 *
 *   Action = {
 *     $typeName: "...Action",
 *     kind: { kind: "<actionFieldName>", value: <ConcreteAction> },
 *     telemetryHandler?: StringProp,
 *     actionEventName?: StringProp,
 *   }
 *
 */
function extractActionBody(action: Record<string, unknown>): ExtractedActionBody | undefined {
  const telemetryHandler = action.telemetryHandler ?? action.telemetry_handler;
  const actionEventName = action.actionEventName ?? action.action_event_name;

  const inner = unwrapOneOf(action);
  if (inner && isRecord(inner.propValue) && inner.propValue.actionType !== undefined) {
    return {
      actionType: inner.propValue.actionType,
      actionParams: inner.propValue.actionParams,
      telemetryHandler,
      actionEventName,
    };
  }

  if (action.actionType !== undefined) {
    return {
      actionType: action.actionType,
      actionParams: action.actionParams,
      telemetryHandler,
      actionEventName,
    };
  }
  return undefined;
}

/** Numeric guard for `ActionType` — narrows `number` to the enum's literal union without an unsafe cast or unsafe enum comparison. */
function isKnownActionType(value: number): value is ActionType {
  for (const enumValue of Object.values(ActionType)) {
    if (Number(enumValue) === value) return true;
  }
  return false;
}

function parseActionType(raw: unknown, ctx: BindingContext): ActionType {
  if (typeof raw === "string") {
    try {
      return enumFromJson(ActionTypeSchema, raw);
    } catch {
      reportBindingError(
        SduiErrorName.InvalidActionType,
        ctx,
        `ActionType enum string "${raw}" did not parse against ActionTypeSchema`,
        { actionType: raw },
      );
      return ActionType.INVALID;
    }
  }
  if (typeof raw === "number" && isKnownActionType(raw)) {
    return raw;
  }
  reportBindingError(SduiErrorName.InvalidActionType, ctx, `ActionType missing on Action body`);
  return ActionType.INVALID;
}

/**
 * Resolves a single action param. Primitives and unwrapped values pass through.
 */
function resolveParam(param: unknown, request: PropBuildRequest): ResolvedProp {
  if (param === null || param === undefined || typeof param !== "object") {
    return { value: param, category: "literal" };
  }
  return request.buildProp(param, request.ctx);
}

function readResolvedValue(result: ResolvedProp): unknown {
  if (result.category === "propSignal") {
    return result.signal.value;
  }
  return result.value;
}

function readResolvedStatus(result: ResolvedProp): DataStatus {
  if (result.category === "failed") return DataStatus.Failed;
  if (result.category === "propSignal") {
    return result.statusSignal?.value ?? DataStatus.Ready;
  }
  return DataStatus.Ready;
}

function isSduiActionData(value: unknown): value is SduiActionData {
  return isRecord(value) && typeof value.actionType === "number" && isRecord(value.actionParams);
}

function failActionField(
  fieldName: string,
  result: Extract<ResolvedProp, { category: "failed" }>,
  ctx: BindingContext,
): ResolvedProp {
  const error = `Failed to build action field "${fieldName}": ${result.error}`;
  reportBindingError(SduiErrorName.MalformedActionParam, ctx, error);
  return { value: undefined, category: "failed", error };
}

function isActionProp(value: unknown): value is Record<string, unknown> {
  return isRecord(value) && extractDescriptorName(value) === "ActionProp";
}

function isActionPropList(value: unknown): value is Record<string, unknown>[] {
  return Array.isArray(value) && value.every(isActionProp);
}

function resolveRepeatedActionPropParam(
  params: Record<string, unknown>[],
  request: PropBuildRequest,
  ctx: BindingContext,
): ResolvedProp {
  const resolvedResults: ResolvedProp[] = params.map((param, index) => {
    const paramCtx: BindingContext = {
      ...ctx,
      propName: ctx.propName ? `${ctx.propName}[${index}]` : `[${index}]`,
    };
    if (!unwrapOneOf(param)) {
      reportBindingError(
        SduiErrorName.MalformedRepeatedActionParam,
        paramCtx,
        `ActionProp child at index ${index} has no \`kind\` oneOf wrapper`,
      );
      return { value: undefined, category: "literal" };
    }

    const result = request.buildProp(param, paramCtx);
    return result.category === "failed" ? { value: undefined, category: "literal" } : result;
  });

  const reactiveResults = resolvedResults.filter(result => result.category === "propSignal");

  if (reactiveResults.length === 0) {
    return {
      value: createSduiListValue(resolvedResults.map(result => result.value)),
      category: "literal",
    };
  }

  const statusSignal = computedEqual(
    () =>
      aggregateStatus(
        reactiveResults.map(result => {
          const status = readResolvedStatus(result);
          return status === DataStatus.Failed ? DataStatus.Ready : status;
        }),
      ),
    shallowEqual,
  );

  const listSignal = computedEqual(() => {
    return asShallowEqualValue(
      createSduiListValue(
        resolvedResults.map(result =>
          readResolvedStatus(result) === DataStatus.Failed ? undefined : readResolvedValue(result),
        ),
      ),
    );
  }, shallowEqual);

  return {
    value: listSignal.peek(),
    category: "propSignal",
    signal: listSignal,
    statusSignal,
  };
}

/**
 * Treats empty strings as "not set".
 */
function coerceOptionalString(value: unknown): string | undefined {
  if (typeof value !== "string" || value.length === 0) return undefined;
  return value;
}

function buildActionData(
  actionType: ActionType,
  actionParams: Record<string, unknown>,
  telemetryHandler: string | undefined,
  actionEventName: string | undefined,
  buildContext: ActionBuildContext | undefined,
): SduiActionData {
  return {
    actionType,
    actionParams,
    analyticsContext: buildContext?.analyticsContext,
    pageContext: buildContext?.pageContext,
    ...(telemetryHandler !== undefined ? { telemetryHandler } : {}),
    ...(actionEventName !== undefined ? { actionEventName } : {}),
  };
}

function buildResolvedActionData(
  actionType: ActionType,
  actionParams: Record<string, unknown>,
  telemetryHandler: string | undefined,
  actionEventName: string | undefined,
  buildContext: ActionBuildContext | undefined,
  repeatedActionParamKeys: readonly string[],
): SduiActionData | undefined {
  const hasNoPresentRepeatedActions =
    repeatedActionParamKeys.length > 0 &&
    repeatedActionParamKeys.every(key => {
      const actions = actionParams[key];
      return !isSduiListValue(actions) || actions.every(action => action == null);
    });

  return hasNoPresentRepeatedActions
    ? undefined
    : buildActionData(actionType, actionParams, telemetryHandler, actionEventName, buildContext);
}

/**
 * Resolves an action source to plain `SduiActionData`. The exported builder
 * wraps this source once in an action snapshot after conditional selection,
 * ensuring the outer conditional status gates both href and activation.
 *
 * Each param is run through its own prop builder so
 * binding paths become signals and literals are unwrapped.
 */
function buildActionSource(
  propType: string,
  propValue: unknown,
  request: PropBuildRequest,
  options: PropBuildOptions = { kind: "none" },
): ResolvedProp {
  const ctx: BindingContext = { ...request.ctx, parserName: propType };
  const childRequest: PropBuildRequest = { ...request, ctx };

  if (propType === PROP_KIND.CONDITIONAL) {
    const conditionalBody = isRecord(propValue) ? propValue : {};
    // Forward `options` so each branch keeps the build-time action context
    // (analytics + page) through the conditional recursion.
    return generateConditionalPropValue(conditionalBody, childRequest, buildActionSource, options);
  }

  if (propType !== "value") {
    reportBindingError(
      SduiErrorName.MalformedActionParam,
      ctx,
      `ActionProp got unknown propType="${propType}"; expected "value" or "conditional"`,
    );
    return {
      value: undefined,
      category: "failed",
      error: `Invalid action prop type: ${propType}`,
    };
  }

  if (!isRecord(propValue)) {
    reportBindingError(
      SduiErrorName.MalformedActionParam,
      ctx,
      `ActionProp value must be an Action message object; got ${typeof propValue}`,
    );
    return { value: undefined, category: "failed", error: "Invalid action" };
  }

  const actionBody = extractActionBody(propValue);
  if (!actionBody) {
    reportBindingError(
      SduiErrorName.MalformedActionParam,
      ctx,
      `ActionProp could not extract Action body (missing actionType / oneOf kind)`,
    );
    return { value: undefined, category: "failed", error: "Could not extract action body" };
  }

  const actionType = parseActionType(actionBody.actionType, ctx);
  const paramDefs = isRecord(actionBody.actionParams) ? actionBody.actionParams : {};
  const buildContext: ActionBuildContext | undefined =
    options.kind === "action" ? options.build : undefined;

  const resolvedParamResults: Record<string, ResolvedProp> = {};
  const repeatedActionParamKeys: string[] = [];

  for (const [key, rawParam] of Object.entries(paramDefs)) {
    const paramCtx: BindingContext = {
      ...ctx,
      propName: ctx.propName ? `${ctx.propName}.params.${key}` : `params.${key}`,
    };
    const isRepeatedActionParam = isActionPropList(rawParam);
    const resolved = isRepeatedActionParam
      ? resolveRepeatedActionPropParam(rawParam, childRequest, paramCtx)
      : resolveParam(rawParam, { ...childRequest, ctx: paramCtx });
    if (resolved.category === "failed") {
      return failActionField(key, resolved, paramCtx);
    }
    if (isRepeatedActionParam) {
      repeatedActionParamKeys.push(key);
    }
    resolvedParamResults[key] = resolved;
  }

  const telemetryCtx: BindingContext = {
    ...ctx,
    propName: ctx.propName ? `${ctx.propName}.telemetryHandler` : "telemetryHandler",
  };
  const telemetryResolved = resolveParam(actionBody.telemetryHandler, {
    ...childRequest,
    ctx: telemetryCtx,
  });
  if (telemetryResolved.category === "failed") {
    return failActionField("telemetryHandler", telemetryResolved, telemetryCtx);
  }

  const actionEventNameCtx: BindingContext = {
    ...ctx,
    propName: ctx.propName ? `${ctx.propName}.actionEventName` : "actionEventName",
  };
  const actionEventNameResolved = resolveParam(actionBody.actionEventName, {
    ...childRequest,
    ctx: actionEventNameCtx,
  });
  if (actionEventNameResolved.category === "failed") {
    return failActionField("actionEventName", actionEventNameResolved, actionEventNameCtx);
  }

  const initialParams: Record<string, unknown> = {};
  for (const [key, result] of Object.entries(resolvedParamResults)) {
    initialParams[key] = result.value;
  }
  const initialTelemetryName = coerceOptionalString(telemetryResolved.value);
  const initialActionEventName = coerceOptionalString(actionEventNameResolved.value);
  const reactiveResults = [
    ...Object.values(resolvedParamResults),
    telemetryResolved,
    actionEventNameResolved,
  ].filter(result => result.category === "propSignal");

  if (reactiveResults.length === 0) {
    return {
      value: buildResolvedActionData(
        actionType,
        initialParams,
        initialTelemetryName,
        initialActionEventName,
        buildContext,
        repeatedActionParamKeys,
      ),
      category: "literal",
    };
  }

  const readCurrentActionFields = () => {
    const currentParams: Record<string, unknown> = {};
    for (const [key, result] of Object.entries(resolvedParamResults)) {
      currentParams[key] = readResolvedValue(result);
    }
    return {
      actionParams: currentParams,
      telemetryHandler: coerceOptionalString(readResolvedValue(telemetryResolved)),
      actionEventName: coerceOptionalString(readResolvedValue(actionEventNameResolved)),
    };
  };

  const statusSignal = computedEqual(
    () => aggregateStatus(reactiveResults.map(readResolvedStatus)),
    shallowEqual,
  );

  const actionDataSignal = computedEqual(() => {
    const current = readCurrentActionFields();
    return asShallowEqualValue(
      buildResolvedActionData(
        actionType,
        current.actionParams,
        current.telemetryHandler,
        current.actionEventName,
        buildContext,
        repeatedActionParamKeys,
      ),
    );
  }, shallowEqual);

  return {
    value: actionDataSignal.peek(),
    category: "propSignal",
    signal: actionDataSignal,
    statusSignal,
  };
}

function snapshotActionSource(source: ResolvedProp, ctx: BindingContext): ResolvedProp {
  if (source.category === "failed") return source;
  if (source.category === "nestedConfig") {
    const error = "ActionProp unexpectedly resolved to a nested component config";
    reportBindingError(SduiErrorName.MalformedActionParam, ctx, error);
    return { value: undefined, category: "failed", error };
  }

  /**
   * Returns `undefined` when the source resolved with no value at all, meaning
   * there is no action to hand the component.
   */
  const readActionValue = (): SduiActionValue | undefined => {
    const status = readResolvedStatus(source);
    if (status !== DataStatus.Ready) {
      return createSduiActionValue({ status });
    }

    const actionData = readResolvedValue(source);
    if (actionData === undefined) return undefined;

    if (!isSduiActionData(actionData)) {
      reportBindingError(
        SduiErrorName.MalformedActionParam,
        ctx,
        "ActionProp produced a ready value without valid action data",
      );
      return createSduiActionValue({ status: DataStatus.Failed });
    }

    return createSduiActionValue({ status: DataStatus.Ready, actionData });
  };

  if (source.category === "literal") {
    return {
      value: readActionValue(),
      category: "literal",
    };
  }

  const actionValueSignal = computed(readActionValue);

  return {
    value: actionValueSignal.peek(),
    category: "propSignal",
    signal: actionValueSignal,
    statusSignal: source.statusSignal,
  };
}

/**
 * Builds one inspectable action snapshot for the complete ActionProp, including
 * conditional selection and nested reactive fields.
 */
export function buildActionProp(
  propType: string,
  propValue: unknown,
  request: PropBuildRequest,
  options: PropBuildOptions = { kind: "none" },
): ResolvedProp {
  const source = buildActionSource(propType, propValue, request, options);
  return snapshotActionSource(source, { ...request.ctx, parserName: propType });
}
