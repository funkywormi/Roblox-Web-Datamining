import type { BindingContext } from "../../../types";

/**
 * Appends a segment to a `BindingContext.propName` for child error
 * reporting. The segment is appended verbatim — callers control whether
 * they need `.key` or `[index]` semantics. When the parent has no
 * propName yet, a leading `.` is stripped so root contexts read cleanly
 * (e.g. `.foo` at root becomes `foo`; `[0]` at root stays `[0]`).
 */
export function childCtx(parent: BindingContext, segment: string): BindingContext {
  const propName = parent.propName ? `${parent.propName}${segment}` : segment.replace(/^\./, "");
  return { ...parent, propName };
}
