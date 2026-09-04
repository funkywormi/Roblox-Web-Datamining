import { isSduiResolvedAction, readArrayActionParam } from "../../actions/readParam";
import { SduiErrorName } from "../../errors/SduiErrors";
import type { SduiActionHandlerConfig } from "../../types";

function readChildActions(actionParams: Record<string, unknown>): unknown[] | undefined {
  const actions = readArrayActionParam(actionParams, "actions", undefined);
  return actions;
}

export function resolveActionSequenceHref(
  actionParams: Record<string, unknown>,
): string | undefined {
  const actions = readChildActions(actionParams);
  if (!actions) return undefined;

  // Actions run in declaration order, so the final navigable child defines the destination.
  for (let index = actions.length - 1; index >= 0; index -= 1) {
    const child = actions[index];
    if (!isSduiResolvedAction(child) || child.href == null) continue;
    return child.href;
  }

  return undefined;
}

/**
 * Starts each child in declaration order without awaiting asynchronous completion.
 * Sequences do not provide state transitions, rollback, or atomic execution.
 */
export const actionSequenceHandler: NonNullable<SduiActionHandlerConfig["handler"]> = (
  actionConfig,
  _analyticsContext,
  ctx,
) => {
  const { actionParams } = actionConfig;

  const actions = readChildActions(actionParams);
  if (actions === undefined) {
    ctx.errorReporter.reportSduiError(
      SduiErrorName.MalformedActionParam,
      `ActionSequence actionParam "actions" must be an array; got ${typeof actionParams.actions}`,
      ctx.pageContext,
      { actionType: "ActionSequence", propName: "actions" },
    );
    return;
  }

  const { actions: _actions, ...paramOverrides } = actionParams;

  for (let index = 0; index < actions.length; index += 1) {
    const childAction = actions[index];
    if (childAction == null) continue;

    if (!isSduiResolvedAction(childAction)) {
      ctx.errorReporter.reportSduiError(
        SduiErrorName.MalformedActionParam,
        `ActionSequence child at index ${index} is not a resolved action: ${typeof childAction}`,
        ctx.pageContext,
        { actionType: "ActionSequence", propName: "actions" },
      );
      continue;
    }

    try {
      childAction.onActivated(paramOverrides);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      ctx.errorReporter.reportSduiError(
        SduiErrorName.FailedToExecuteAction,
        `ActionSequence child at index ${index} failed synchronously: ${errorMessage}`,
        ctx.pageContext,
        { actionType: "ActionSequence" },
      );
    }
  }
};
