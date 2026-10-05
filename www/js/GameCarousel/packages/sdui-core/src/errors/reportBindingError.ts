import type { BindingContext, SduiErrorDimensions } from "../types";
import { reportError } from "./SduiLogger";
import { SduiErrorName } from "./SduiErrors";

/**
 * Builds the standard `SduiErrorDimensions` slice from a `BindingContext`.
 * All binding-time error reports should at minimum carry these so the
 * dashboard buckets cleanly by component / parser / prop.
 */
export function bindingDimensions(ctx: BindingContext): SduiErrorDimensions {
  return {
    componentType: ctx.componentType,
    propName: ctx.propName,
    parserName: ctx.parserName,
  };
}

/**
 * Reports an arbitrary binding-time error against the supplied
 * `BindingContext`. Thin wrapper over `reportError` that fills in the
 * standard dimensions plus the context's `pageContext` and `errorReporter`.
 */
export function reportBindingError(
  errorName: SduiErrorName,
  ctx: BindingContext,
  message: string,
  extras?: SduiErrorDimensions,
): void {
  reportError(
    errorName,
    message,
    ctx.pageContext,
    { ...bindingDimensions(ctx), ...extras },
    ctx.errorReporter,
  );
}

/**
 * Reports a `LazyNestedListInvalidConfig` error. Use for malformed prop
 * payloads, missing required fields, unknown variants — anything where the
 * config itself is wrong as opposed to a runtime parse failure.
 */
export function reportInvalidConfig(
  ctx: BindingContext,
  message: string,
  extras?: SduiErrorDimensions,
): void {
  reportBindingError(SduiErrorName.LazyNestedListInvalidConfig, ctx, message, extras);
}

/**
 * Reports a `FailedToParseProp` error. Use when a builder threw while
 * processing structurally-valid config (e.g. per-iteration item build,
 * formatter crash) — runtime failures, not schema mistakes.
 */
export function reportFailedToParse(
  ctx: BindingContext,
  message: string,
  extras?: SduiErrorDimensions,
): void {
  reportBindingError(SduiErrorName.FailedToParseProp, ctx, message, extras);
}
