import { useEffect, useMemo } from "react";
import * as http from "@rbx/core-lib/http";
import { Url } from "@rbx/core-lib/url";
import { AbortError } from "@rbx/core-lib/http";
import { PROMPTS_IMPRESSION_URL } from "../constants/urlConstants";
import type { AppPage } from "../constants/pageConstants";
import type { ClientAttributes } from "../types/promptTypes";
import { serializeClientAttributes } from "../utils/stringSerializerUtils";
import { getPromptsErrorReporter } from "../telemetry/promptsErrorReporter";
import { PromptError } from "../telemetry/promptErrors";
import { getSduiAnalyticsReporter } from "../services/sduiServices";
import { buildPromptImpressionMetric } from "../telemetry/promptImpressionMetric";

export const usePromptImpressionEmitter = ({
  enabled,
  appPage,
  promptType,
  promptId,
  clientAttributes,
}: {
  enabled: boolean;
  appPage: AppPage;
  promptType?: string;
  promptId?: string;
  clientAttributes?: ClientAttributes;
}) => {
  const serializedClientAttributes = useMemo(
    () => serializeClientAttributes(clientAttributes),
    [clientAttributes],
  );

  useEffect(() => {
    if (!enabled || !promptType || !promptId) {
      return;
    }

    const { reportPromptError } = getPromptsErrorReporter();

    const emitMetric = async () => {
      const url = Url.parse(PROMPTS_IMPRESSION_URL).getOrThrow();

      const result = await http.postUntyped(
        url,
        { promptType, promptId, clientAttributes },
        { credentials: "include" },
      );

      if (result.isErr() && !(result.error instanceof AbortError)) {
        reportPromptError(
          PromptError.impression.post({
            appPage,
            promptType,
            promptId,
            errorMessage: result.error.message,
          }),
        );
      }
    };

    emitMetric().catch((error: unknown) => {
      const errorMessage = error instanceof Error ? error.message : String(error);
      reportPromptError(
        PromptError.impression.emitter({
          appPage,
          promptType,
          promptId,
          errorMessage,
        }),
      );
    });

    const analyticsReporter = getSduiAnalyticsReporter(appPage);
    analyticsReporter.logEvent(
      ...buildPromptImpressionMetric({
        appPage,
        modalId: promptId,
        modalType: promptType,
      }),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, promptType, promptId, appPage, serializedClientAttributes]);
};
