import * as http from "@rbx/core-lib/http";
import { AbortError } from "@rbx/core-lib/http";
import { Url } from "@rbx/core-lib/url";
import { SduiErrorName } from "@rbx/sdui-core";
import type { SduiActionHandlerConfig } from "@rbx/sdui-core";
import { PROMPTS_DISMISS_URL } from "../../constants/urlConstants";
import { getActionHandlerApiStore } from "../../services/getActionHandlerApiStore";

export const dismissPromptHandler: SduiActionHandlerConfig = {
  handler: (actionConfig, _analyticsContext, ctx) => {
    const { actionParams } = actionConfig;
    const { errorReporter, pageContext } = ctx;

    const promptType =
      typeof actionParams.promptType === "string" ? actionParams.promptType : undefined;
    if (!promptType) {
      errorReporter.reportSduiError(
        SduiErrorName.MalformedActionParam,
        `Invalid or missing promptType: ${String(actionParams.promptType)}`,
        pageContext,
        undefined,
        { additionalContext: { actionType: "DismissPrompt" } },
      );
      return;
    }

    const { promptId } = actionParams;
    if (promptId != null && typeof promptId !== "string") {
      const promptIdStr = JSON.stringify(promptId);
      errorReporter.reportSduiError(
        SduiErrorName.MalformedActionParam,
        `Invalid promptId: ${promptIdStr}`,
        pageContext,
        undefined,
        {
          additionalTags: { promptType },
          additionalContext: { actionType: "DismissPrompt", promptId: promptIdStr },
        },
      );
      return;
    }

    const entityId = typeof actionParams.entityId === "string" ? actionParams.entityId : undefined;
    const entityType =
      typeof actionParams.entityType === "string" ? actionParams.entityType : undefined;

    if ((entityType && !entityId) || (!entityType && entityId)) {
      errorReporter.reportSduiError(
        SduiErrorName.MalformedActionParam,
        `Incomplete entity params: entityType=${String(entityType)}, entityId=${String(entityId)}`,
        pageContext,
        undefined,
        {
          additionalTags: { promptType },
          additionalContext: { actionType: "DismissPrompt", promptId, entityType, entityId },
        },
      );
    }

    const clientAttributes: Record<string, string> | undefined =
      entityType && entityId ? { [entityType]: entityId } : undefined;

    const url = Url.parse(PROMPTS_DISMISS_URL).getOrThrow();

    const apiStore = getActionHandlerApiStore(pageContext.appPage);
    const affectedConfigKeys = apiStore.dismissEntry(promptType);

    void http
      .postUntyped(
        url,
        { promptType, promptId, clientAttributes },
        { credentials: "include", keepalive: true },
      )
      .inspectErr(error => {
        if (!(error instanceof AbortError)) {
          errorReporter.reportSduiError(
            SduiErrorName.FailedToExecuteAction,
            `Dismiss request failed for promptType=${promptType}`,
            pageContext,
            undefined,
            {
              additionalTags: { promptType },
              additionalContext: { actionType: "DismissPrompt", promptId },
            },
          );
        }
      })
      .getOrNull()
      .then(result => {
        if (result !== null) {
          for (const configKey of affectedConfigKeys) {
            void apiStore.refreshFromApi(configKey);
          }
        }
      });
  },
};
