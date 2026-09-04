/**
 * Shared signal plumbing for SDUI prop builders.
 *
 * Each helper resolves a prop value through a `computed` and exposes it as a
 * `ResolvedProp` of category `"propSignal"` whose value/status are split into
 * two `computedEqual(..., shallowEqual)` signals. Splitting lets a value
 * change re-emit without re-emitting an unchanged status, and vice versa.
 *
 * Documented web/lua divergences live in the inline comments of the relevant helpers.
 */
import { computed, type ReadonlySignal } from "@preact/signals-core";

import { reportBindingError, SduiErrorName } from "../../../errors";
import { asShallowEqualValue, computedEqual, shallowEqual } from "../../../signals/computedEqual";
import type {
  BindingContext,
  HydrationRead,
  Parser,
  PropBuilder,
  PropBuildOptions,
  PropBuildRequest,
  ResolvedProp,
} from "../../../types";
import { DataStatus } from "../../../types";
import { isRecord } from "../../../utils/typeGuards";

import { isOneOf } from "../../../utils/oneOfHelper";
import { resolveBindingPath } from "../../SduiDataBinder";
import { evaluateCondition } from "./conditionEvaluator";

/**
 * Per-read `DataStatus` accumulator threaded through nested resolvers
 * (format args, table fields). The outer `computed` allocates a fresh array,
 * each leaf read appends, and `aggregateStatus` collapses to a single status.
 */
export type StatusCollector = DataStatus[];

/**
 * Wrap a combined `{ value, status }` signal in the standard `propSignal`
 * `ResolvedProp` shape. The outer signals only re-emit when their projected
 * field changes (shallowEqual gate), so a status flip on an unchanged value
 * doesn't churn value subscribers and vice versa.
 */
function buildPropSignalFromCombined(combinedRead: ReadonlySignal<HydrationRead>): ResolvedProp {
  const valueSignal = computedEqual(
    () => asShallowEqualValue(combinedRead.value.value),
    shallowEqual,
  );
  const statusSignal = computedEqual(() => combinedRead.value.status, shallowEqual);
  return {
    value: valueSignal.peek(),
    category: "propSignal",
    signal: valueSignal,
    statusSignal,
  };
}

/** Worst-case rollup: any `Failed` short-circuits, otherwise any `NotReady` wins. */
export function aggregateStatus(statuses: readonly DataStatus[]): DataStatus {
  let sawNotReady = false;
  for (const status of statuses) {
    if (status === DataStatus.Failed) return DataStatus.Failed;
    if (status === DataStatus.NotReady) sawNotReady = true;
  }
  return sawNotReady ? DataStatus.NotReady : DataStatus.Ready;
}

/**
 * Canonical reactive read for consumers that need the combined value/status
 * rather than the public `ResolvedProp` projection.
 */
export function createDynamicBindingRead(
  bindingPath: string,
  request: PropBuildRequest,
): ReadonlySignal<HydrationRead>;
export function createDynamicBindingRead<T>(
  bindingPath: string,
  request: PropBuildRequest,
  propParser: (value: unknown, ctx: BindingContext) => T,
): ReadonlySignal<HydrationRead<T>>;
export function createDynamicBindingRead(
  bindingPath: string,
  request: PropBuildRequest,
  propParser?: (value: unknown, ctx: BindingContext) => unknown,
): ReadonlySignal<HydrationRead> {
  const { dataSources, dataBinder, ctx } = request;
  const rawRead = computedEqual<HydrationRead>(
    () => {
      const { value: rawValue, status } = resolveBindingPath(
        bindingPath,
        dataSources,
        dataBinder,
        ctx,
      );
      return { value: rawValue, status };
    },
    (previous, next) => previous.value === next.value && previous.status === next.status,
  );
  if (!propParser) return rawRead;

  return computed<HydrationRead>(() => {
    const { value, status } = rawRead.value;
    return { value: propParser(value, ctx), status };
  });
}

/**
 * Reactive read of a single binding path. The inner `combined` computed runs
 * `resolveBindingPath` once per re-evaluation so value and status come from
 * the same store lookup and the same set of subscribed signals.
 */
export function generateDynamicBindingPropValue(
  bindingPath: string,
  request: PropBuildRequest,
  propParser?: Parser,
): ResolvedProp {
  const { ctx } = request;
  if (!bindingPath) {
    reportBindingError(
      SduiErrorName.InvalidBindingPath,
      ctx,
      `generateDynamicBindingPropValue called with empty bindingPath`,
      { bindingPath },
    );
    return { value: undefined, category: "failed", error: `Invalid bindingPath: ${bindingPath}` };
  }

  const combinedRead = propParser
    ? createDynamicBindingRead(bindingPath, request, propParser)
    : createDynamicBindingRead(bindingPath, request);

  return buildPropSignalFromCombined(combinedRead);
}

/**
 * Reactive read of a `format` string. `resolveStringFormatFn` walks the
 * format body, appending a status per binding-path arg to `statuses`. The
 * outer `computed` aggregates them so the prop reports `NotReady` while any
 * substituted value is still hydrating.
 *
 * `propParser`, when provided, runs on the joined format result inside the
 * same `computed` so the parser sees the fully-substituted string. Mirrors
 * lua's `applyParser(buildStringProp, …)` semantics where the parser runs
 * over every terminal value the string builder produces, regardless of
 * whether it came from a literal, binding, or format expansion.
 */
export function generateFormatStringPropValue(
  format: Record<string, unknown>,
  request: PropBuildRequest,
  resolveStringFormatFn: (
    format: Record<string, unknown>,
    request: PropBuildRequest,
    statusCollector?: StatusCollector,
  ) => string,
  propParser?: Parser,
): ResolvedProp {
  const { ctx } = request;
  const combinedRead = computed<HydrationRead>(() => {
    const statuses: StatusCollector = [];
    const formatted = resolveStringFormatFn(format, request, statuses);
    const value = propParser ? propParser(formatted, ctx) : formatted;
    return { value, status: aggregateStatus(statuses) };
  });
  return buildPropSignalFromCombined(combinedRead);
}

function normalizeConditionalOptions(
  rawValue: Record<string, unknown> | Record<string, unknown>[],
): Record<string, unknown>[] {
  if (Array.isArray(rawValue)) return rawValue;
  if (Array.isArray(rawValue.options)) return rawValue.options.filter(isRecord);
  return [];
}

function selectMatchingBranch(
  options: Record<string, unknown>[],
  request: PropBuildRequest,
  branchBuilder: PropBuilder,
  downstream: PropBuildOptions | undefined,
): HydrationRead {
  const { dataSources, dataBinder, ctx } = request;
  for (const option of options) {
    const condition = isRecord(option.condition) ? option.condition : undefined;
    const evaluated = evaluateCondition(condition, dataSources, dataBinder, ctx);

    if (evaluated.status !== DataStatus.Ready) {
      return { value: undefined, status: evaluated.status };
    }
    if (evaluated.result === undefined) {
      return { value: undefined, status: DataStatus.NotReady };
    }
    if (!evaluated.result) continue;

    const branch = isOneOf(option.kind) ? option.kind : undefined;
    if (!branch) {
      reportBindingError(
        SduiErrorName.FailedToEvaluateConditionalProp,
        ctx,
        "ConditionalOption matched but its `kind` is not a oneOf wrapper",
      );
      return { value: undefined, status: DataStatus.Failed };
    }

    const built = branchBuilder(branch.kind, branch.value, request, downstream);

    if (built.category === "propSignal") {
      // Branch builders construct fresh signals on every re-evaluation;
      // reading `.value` here subscribes the outer `computed` to them for
      // the lifetime of the upstream binding they depend on.
      return {
        value: asShallowEqualValue(built.signal.value),
        status: built.statusSignal ? built.statusSignal.value : DataStatus.Ready,
      };
    }
    if (built.category === "failed") {
      return { value: undefined, status: DataStatus.Failed };
    }
    return { value: asShallowEqualValue(built.value), status: DataStatus.Ready };
  }
  // Every condition evaluated and none matched: resolved, not pending.
  return { value: undefined, status: DataStatus.Ready };
}

/**
 * Reactive read of a `conditional` prop.
 *
 * Each `ConditionalOption` carries a `condition` and a `kind` oneOf wrapper
 * (`{ kind: "<branchType>", value: ... }` after `normalizeProtoValue`). The
 * first option whose condition evaluates true wins; its branch is built via
 * `branchBuilder(propType, propValue, ...)`.
 *
 * Status-aware option selection:
 * if any earlier option's condition cannot yet be evaluated we report
 * `NotReady` instead of skipping past it. This avoids committing to a later
 * option that happens to evaluate against unrelated data while the upstream
 * binding is still hydrating. When every condition evaluated and none matched,
 * the read is `Ready` with no value.
 *
 * `downstream` is the typed `PropBuildOptions` to forward into each branch
 * builder — replaces the previous opaque `context: unknown` slot. Callers
 * pass their own options (e.g. `buildActionProp` re-passes its own
 * `{ kind: "action", build }`) so action / nested-component branches keep
 * their parent telemetry and template wiring.
 *
 * When a branch resolves to a `SduiComponentConfig`, it's detected structurally
 * at render time (`renderer/typeGuards.ts` → `__sduiKind: "config"` brand),
 * so no flag plumbing is needed here.
 */
export function generateConditionalPropValue(
  rawValue: Record<string, unknown> | Record<string, unknown>[],
  request: PropBuildRequest,
  branchBuilder: PropBuilder,
  downstream?: PropBuildOptions,
): ResolvedProp {
  const { ctx } = request;
  const options = normalizeConditionalOptions(rawValue);

  const combinedRead = computed<HydrationRead>(() => {
    try {
      return selectMatchingBranch(options, request, branchBuilder, downstream);
    } catch (err) {
      reportBindingError(
        SduiErrorName.FailedToEvaluateConditionalProp,
        ctx,
        `conditional prop evaluation threw: ${err instanceof Error ? err.message : String(err)}`,
      );
      return { value: undefined, status: DataStatus.NotReady };
    }
  });

  return buildPropSignalFromCombined(combinedRead);
}

/**
 * Builds a framework-owned structured value inside one reactive boundary.
 * Even a fully static record/list is represented as a signal because any
 * recursively-built descendant may itself be reactive.
 */
export function generateStructuredPropSignalValue(
  request: PropBuildRequest,
  description: string,
  resolveValue: (statusCollector: StatusCollector) => unknown,
): ResolvedProp {
  const combinedRead = computed<HydrationRead>(() => {
    try {
      const statuses: StatusCollector = [];
      const value = resolveValue(statuses);
      return { value, status: aggregateStatus(statuses) };
    } catch (err) {
      reportBindingError(
        SduiErrorName.FailedToParseProp,
        request.ctx,
        `failed to build ${description}: ${err instanceof Error ? err.message : String(err)}`,
      );
      return { value: undefined, status: DataStatus.Failed };
    }
  });
  return buildPropSignalFromCombined(combinedRead);
}

/**
 * Resolves a binding path whose value is an encoded structured prop tree,
 * then recursively builds that tree inside the same reactive boundary.
 */
export function generateStructuredBindingPropValue(
  bindingPath: string,
  request: PropBuildRequest,
  description: string,
  resolveValue: (rawValue: unknown, statusCollector: StatusCollector) => unknown,
): ResolvedProp {
  const { dataSources, dataBinder, ctx } = request;
  if (!bindingPath) {
    reportBindingError(
      SduiErrorName.InvalidBindingPath,
      ctx,
      `${description} received an empty binding path`,
      { bindingPath },
    );
    return { value: undefined, category: "failed", error: "Invalid binding path" };
  }

  const combinedRead = computed<HydrationRead>(() => {
    try {
      const outerRead = resolveBindingPath(bindingPath, dataSources, dataBinder, ctx);
      const statuses: StatusCollector = [outerRead.status];
      if (outerRead.status !== DataStatus.Ready) {
        return { value: undefined, status: outerRead.status };
      }
      const value = resolveValue(outerRead.value, statuses);
      return { value, status: aggregateStatus(statuses) };
    } catch (err) {
      reportBindingError(
        SduiErrorName.FailedToParseProp,
        ctx,
        `failed to build bound ${description}: ${err instanceof Error ? err.message : String(err)}`,
        { bindingPath },
      );
      return { value: undefined, status: DataStatus.Failed };
    }
  });
  return buildPropSignalFromCombined(combinedRead);
}

export function generateTokenBindingPropValue(token: string, _ctx: BindingContext): ResolvedProp {
  return { value: token, category: "literal" };
}
