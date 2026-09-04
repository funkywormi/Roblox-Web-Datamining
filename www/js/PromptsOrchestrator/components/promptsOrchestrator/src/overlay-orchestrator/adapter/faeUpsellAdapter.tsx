import { useEffect } from "react";
import { OverlayClosedReason, OverlayNotOpenedReason, type OverlayRenderer } from "../types";
import { type RendererAdapterProps } from "./types";
import { finishPrompt } from "../scheduler/finishPrompt";
import { getPromptsErrorReporter } from "../../common/telemetry/promptsErrorReporter";
import { PromptErrorName } from "../../common/telemetry/constants";
import { extractErrorMessageFromUnknownError } from "../../common/utils/errorMessageUtils";

type FaeUpsell = typeof OverlayRenderer.FaeUpsell;

export const FaeUpsellAdapter = ({ prompt }: RendererAdapterProps<FaeUpsell>) => {
  useEffect(() => {
    const startFaeUpsell = async () => {
      const accessManagementUpsellV2Service = window.Roblox.AccessManagementUpsellV2Service;
      if (!accessManagementUpsellV2Service) {
        const errorReporter = getPromptsErrorReporter();
        errorReporter.reportPromptError({
          errorName: PromptErrorName.AccessManagementUpsellV2ServiceDoesNotExist,
          errorMessage:
            "Could not proceed with facial age estimation upsell because AccessManagementUpsellV2Service does not exist",
          appPage: prompt.payload.appPage ?? "overlay",
        });

        finishPrompt<FaeUpsell>(prompt.id, {
          status: "not-opened",
          reason: OverlayNotOpenedReason.RendererUnavailable,
        });
        return;
      }

      try {
        const result = await accessManagementUpsellV2Service.startAccessManagementUpsell(
          prompt.payload.params,
        );

        finishPrompt<FaeUpsell>(prompt.id, {
          status: "closed",
          reason: result ? OverlayClosedReason.Success : OverlayClosedReason.Failed,
        });
      } catch (error: unknown) {
        const errorReporter = getPromptsErrorReporter();
        errorReporter.reportPromptError({
          errorName: PromptErrorName.FacialAgeEstimationUpsellError,
          errorMessage: extractErrorMessageFromUnknownError(
            error,
            "Facial age estimation upsell failed",
          ),
          appPage: prompt.payload.appPage ?? "overlay",
        });

        finishPrompt<FaeUpsell>(prompt.id, {
          status: "closed",
          reason: OverlayClosedReason.Error,
          error,
        });
      }
    };

    void startFaeUpsell();
  }, [prompt]);

  return null;
};
