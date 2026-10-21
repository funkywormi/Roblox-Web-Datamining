import { ComparisonCondition_Op as ComparisonConditionOp } from "@rbx/service-contracts-proto/roblox/apppageplatform/shared/v1beta1/prop_condition_pb.js";

/**
 * Maps each supported `ComparisonCondition.Op` enum member to the internal
 * operator string used by `conditionEvaluator`.
 *
 * `ComparisonOperator` is inferred from this object so adding an enum value in
 * service-contracts fails type-checking here until the mapping is extended.
 *
 * Returns `undefined` for unrecognized numeric `op` (including `INVALID = 0`).
 * Do NOT add a default fallback — masking drift would pick an unrelated branch.
 */
const COMPARISON_OP_TO_INTERNAL = {
  [ComparisonConditionOp.LT]: "lt",
  [ComparisonConditionOp.LTE]: "lte",
  [ComparisonConditionOp.GT]: "gt",
  [ComparisonConditionOp.GTE]: "gte",
  [ComparisonConditionOp.E]: "eq",
  [ComparisonConditionOp.NE]: "neq",
} as const satisfies Record<Exclude<ComparisonConditionOp, ComparisonConditionOp.INVALID>, string>;

/** Internal strings for supported `ComparisonCondition.Op` values (from {@link COMPARISON_OP_TO_INTERNAL}). */
export type ComparisonOperator =
  (typeof COMPARISON_OP_TO_INTERNAL)[keyof typeof COMPARISON_OP_TO_INTERNAL];

export function comparisonOpToInternal(op: number): ComparisonOperator | undefined {
  if (!(op in COMPARISON_OP_TO_INTERNAL)) return undefined;
  return COMPARISON_OP_TO_INTERNAL[op as keyof typeof COMPARISON_OP_TO_INTERNAL];
}
