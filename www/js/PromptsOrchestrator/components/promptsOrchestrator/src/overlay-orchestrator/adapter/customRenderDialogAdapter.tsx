import { Fragment, useCallback, type ReactElement } from "react";
import { SduiErrorBoundary } from "@rbx/sdui-core/client";
import { PromptError } from "../../common/telemetry/promptErrors";
import { getPromptsErrorReporter } from "../../common/telemetry/promptsErrorReporter";
import type { DialogRenderContext } from "../../overlay/types";
import { finishPrompt } from "../scheduler/finishPrompt";
import { OverlayClosedReason, type OverlayRenderer } from "../types";
import type { RendererAdapterProps } from "./types";

const getErrorBoundaryKey = (id: string, dedupeKey: string): string => `${id}-${dedupeKey}`;

type CustomRenderDialog = typeof OverlayRenderer.CustomRenderDialog;

type CustomRenderDialogProps = RendererAdapterProps<CustomRenderDialog>;

// Invoke client code below the boundary so it catches render-function errors too.
const CustomRenderDialogContent = ({ prompt }: CustomRenderDialogProps): ReactElement => {
  const onClose = useCallback<DialogRenderContext["onClose"]>(
    options => {
      finishPrompt<CustomRenderDialog>(prompt.id, {
        status: "closed",
        reason: options?.reason ?? OverlayClosedReason.Completed,
      });
    },
    [prompt.id],
  );

  return <Fragment>{prompt.payload.render({ onClose })}</Fragment>;
};

export const CustomRenderDialogAdapter = ({ prompt }: CustomRenderDialogProps): ReactElement => {
  const onError = (error: Error): void => {
    try {
      getPromptsErrorReporter().reportPromptError(
        PromptError.render.uncaught({
          appPage: prompt.payload.appPage ?? "overlay",
          componentType: "CustomRenderDialog",
          errorMessage: error.message,
        }),
      );
    } finally {
      finishPrompt<CustomRenderDialog>(prompt.id, {
        status: "closed",
        reason: OverlayClosedReason.Error,
        error,
      });
    }
  };

  return (
    <SduiErrorBoundary key={getErrorBoundaryKey(prompt.id, prompt.dedupeKey)} onError={onError}>
      <CustomRenderDialogContent prompt={prompt} />
    </SduiErrorBoundary>
  );
};
