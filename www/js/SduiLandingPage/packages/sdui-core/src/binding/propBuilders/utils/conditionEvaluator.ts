/**
 * Evaluates `PropCondition` proto messages used by `conditional` props.
 *
 * Mirrors lua-apps `SduiPropUtils.evaluateCondition`. Web diverges on
 * error handling — unknown operators/condition kinds log and degrade with
 * `result: undefined` and `Failed` (schema/proto drift won't heal without a
 * deploy) instead of throwing or committing to `Ready` + `false`.
 *
 * Returns a `ConditionResult` carrying both the boolean answer and the
 * worst input `DataStatus` seen during evaluation. Callers must not coerce
 * `result === undefined` to `true`/`false`.
 */
import type { ReadonlySignal } from "@preact/signals-core";

import { reportBindingError, SduiErrorName } from "../../../errors";
import type { BindingContext, DataBindingSources, SduiDataBinder } from "../../../types";
import { DataStatus } from "../../../types";
import { asRecord } from "../../../utils/typeGuards";

import { resolveBindingPath } from "../../SduiDataBinder";
import { isOneOf, unwrapOneOf } from "../../../utils/oneOfHelper";
import { ComparisonOperator, comparisonOpToInternal } from "../../../utils/comparison";

type Condition = Record<string, unknown> | undefined;

/**
 * Evaluation outcome for a `Condition`.
 *
 * - `result === true | false` — condition has a definitive answer.
 * - `result === undefined` — at least one input is not yet `Ready`. Callers
 *   must defer; never coerce to `true`/`false`.
 *
 * `status` is the worst input status seen during evaluation. Leaf branches
 * propagate `NotReady` / `Failed` up so consumers can render skeletons
 * instead of committing to a wrong branch.
 */
export interface ConditionResult {
  result: boolean | undefined;
  status: DataStatus;
}

const READY_TRUE: ConditionResult = { result: true, status: DataStatus.Ready };
const READY_FALSE: ConditionResult = { result: false, status: DataStatus.Ready };

function deferred(status: DataStatus): ConditionResult {
  return { result: undefined, status };
}

function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function asNumber(value: unknown): number {
  return typeof value === "number" ? value : 0;
}

function asConditionList(value: unknown): Condition[] {
  if (!Array.isArray(value)) return [];
  return value.map(asRecord);
}

/** Stringify scalars without falling into Object's default `[object Object]`. */
function safeString(value: unknown): string {
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean" || typeof value === "bigint") {
    return String(value);
  }
  return "";
}

function parseBool(value: unknown): boolean {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") return value === "true" || value === "1";
  if (typeof value === "number") return value !== 0;
  return false;
}

/**
 * Type-coercing equality matching lua-apps `isSame`. Coerces `lhs` to the
 * runtime type of `rhs` before comparing. `null` and `undefined` compare
 * equal to each other (parity with lua `nil == nil`).
 */
function isSame(lhs: unknown, rhs: unknown): boolean {
  if (lhs === rhs) return true;
  if (lhs == null) return rhs == null;
  if (rhs == null) return false;
  if (typeof rhs === "string") return safeString(lhs) === rhs;
  if (typeof rhs === "number") return Number(lhs) === rhs;
  if (typeof rhs === "boolean") return parseBool(lhs) === rhs;
  return false;
}

/**
 * Proto3 "no value" check matching lua-apps `isEmpty`: `null`/`undefined`,
 * empty string, empty array, empty object. Numeric `0` and boolean `false`
 * are NOT empty — use a `comparison` (`OP_E` / `OP_NE`) for those.
 */
function isEmpty(value: unknown): boolean {
  if (value == null) return true;
  if (value === "") return true;
  if (Array.isArray(value)) return value.length === 0;
  const record = asRecord(value);
  if (record !== undefined) return Object.keys(record).length === 0;
  return false;
}

/**
 * Reads `ComparisonCondition.kind`. After `normalizeProtoValue` the field
 * is a oneOf wrapper (`{ kind: "stringValue" | …, value: <primitive> }`);
 * the unwrapped primitive is what gets compared. Bare primitives are
 * passed through unchanged when not wrapped.
 */
function extractCompareValue(kind: unknown): unknown {
  if (isOneOf(kind)) return kind.value;
  return kind;
}

/** Resolve a single `field` binding path; defer if not yet `Ready`. */
function readField(
  field: unknown,
  dataSources: ReadonlySignal<DataBindingSources>,
  dataBinder: SduiDataBinder,
  ctx: BindingContext,
): { value: unknown; deferral: ConditionResult | undefined } {
  const { value, status } = resolveBindingPath(asString(field), dataSources, dataBinder, ctx);
  if (status !== DataStatus.Ready) return { value: undefined, deferral: deferred(status) };
  return { value, deferral: undefined };
}

function evaluateOperator(
  operator: ComparisonOperator,
  value: unknown,
  compareValue: unknown,
): boolean {
  switch (operator) {
    case "eq":
      return isSame(value, compareValue);
    case "neq":
      return !isSame(value, compareValue);
    case "gt":
      return Number(value) > Number(compareValue);
    case "gte":
      return Number(value) >= Number(compareValue);
    case "lt":
      return Number(value) < Number(compareValue);
    case "lte":
      return Number(value) <= Number(compareValue);
    default:
      return false;
  }
}

/**
 * Evaluates a `PropCondition` payload after proto normalization — the oneOf
 * wrapper `{ kind: { kind: "comparison" | "isNull" | …, value: { … } } }`.
 * Unrecognized top-level objects fall through as unconditional `true` (same
 * as a missing condition).
 */
export function evaluateCondition(
  condition: Condition,
  dataSources: ReadonlySignal<DataBindingSources>,
  dataBinder: SduiDataBinder,
  ctx: BindingContext,
): ConditionResult {
  if (!condition) return READY_TRUE;

  const inner = unwrapOneOf(condition);
  if (inner) {
    const body = asRecord(inner.propValue) ?? {};
    // `evaluateRawCondition` recurses back through `evaluateCondition` for
    // and/or branches; declarations are hoisted so the call is safe.
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    return evaluateRawCondition(inner.propType, body, dataSources, dataBinder, ctx);
  }

  return READY_TRUE;
}

/**
 * AND / OR with status propagation (mirrors lua and_condition / or_condition):
 * - Any sub with a non-Ready status short-circuits and propagates.
 * - AND short-circuits to `false` on any falsy sub; all-true → `true`.
 * - OR short-circuits to `true` on any true sub, propagates `undefined`
 *   subs (we cannot confidently say the OR is false); all-false → `false`.
 */
function evaluateCombinator(
  kind: "and" | "or",
  subConditions: Condition[],
  dataSources: ReadonlySignal<DataBindingSources>,
  dataBinder: SduiDataBinder,
  ctx: BindingContext,
): ConditionResult {
  for (const sub of subConditions) {
    const subResult = evaluateCondition(sub, dataSources, dataBinder, ctx);
    if (subResult.status !== DataStatus.Ready) return subResult;
    if (kind === "and") {
      if (!subResult.result) return READY_FALSE;
    } else {
      if (subResult.result === true) return READY_TRUE;
      if (subResult.result === undefined) return subResult;
    }
  }
  return kind === "and" ? READY_TRUE : READY_FALSE;
}

function evaluateRawCondition(
  conditionKind: string,
  body: Record<string, unknown>,
  dataSources: ReadonlySignal<DataBindingSources>,
  dataBinder: SduiDataBinder,
  parentCtx: BindingContext,
): ConditionResult {
  const ctx: BindingContext = { ...parentCtx, parserName: conditionKind };

  switch (conditionKind) {
    case "comparison": {
      const rawOp = asNumber(body.op);
      const operator = comparisonOpToInternal(rawOp);
      const compareValue = extractCompareValue(body.kind);
      const { value, deferral } = readField(body.field, dataSources, dataBinder, ctx);
      if (deferral) return deferral;
      // Mirror lua: a missing value short-circuits to "unknown" rather
      // than coercing to false.
      if (value == null) return deferred(DataStatus.NotReady);
      // Unknown / OP_INVALID: do not evaluate as false — that would commit to
      // a branch; schema drift should surface as Failed like unknown kinds.
      if (operator === undefined) {
        reportBindingError(
          SduiErrorName.UnknownComparisonOperator,
          ctx,
          `unknown ComparisonCondition.Op="${rawOp}"; cannot evaluate`,
        );
        return deferred(DataStatus.Failed);
      }
      return {
        result: evaluateOperator(operator, value, compareValue),
        status: DataStatus.Ready,
      };
    }

    case "isNull": {
      const { value, deferral } = readField(body.field, dataSources, dataBinder, ctx);
      return deferral ?? { result: value == null, status: DataStatus.Ready };
    }
    case "isNotNull": {
      const { value, deferral } = readField(body.field, dataSources, dataBinder, ctx);
      return deferral ?? { result: value != null, status: DataStatus.Ready };
    }
    case "isEmpty": {
      const { value, deferral } = readField(body.field, dataSources, dataBinder, ctx);
      return deferral ?? { result: isEmpty(value), status: DataStatus.Ready };
    }
    case "isNotEmpty": {
      const { value, deferral } = readField(body.field, dataSources, dataBinder, ctx);
      return deferral ?? { result: !isEmpty(value), status: DataStatus.Ready };
    }

    case "andCondition":
      return evaluateCombinator(
        "and",
        asConditionList(body.conditions),
        dataSources,
        dataBinder,
        ctx,
      );
    case "orCondition":
      return evaluateCombinator(
        "or",
        asConditionList(body.conditions),
        dataSources,
        dataBinder,
        ctx,
      );

    default: {
      reportBindingError(
        SduiErrorName.UnknownConditionKind,
        ctx,
        `unknown Condition.kind="${conditionKind}"; reporting Failed`,
      );
      return deferred(DataStatus.Failed);
    }
  }
}
