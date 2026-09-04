import { SduiFeatureEntryPoint } from "@rbx/sdui-core/client";
import { OverlayRenderer } from "../types";
import { type RendererAdapterProps } from "./types";
import { usePromptImpressionEmitter } from "../../common/hooks/usePromptImpressionEmitter";
import { getSduiServices } from "../../common/services/sduiServices";

type DialogPrompt = typeof OverlayRenderer.DialogPrompt;

export const DialogPromptAdapter = ({ prompt }: RendererAdapterProps<DialogPrompt>) => {
  const { configKey, appPage } = prompt.payload;

  usePromptImpressionEmitter({
    enabled: true,
    appPage,
    promptType: prompt.payload.promptEntry.title,
    promptId: prompt.payload.promptEntry.identifier,
    clientAttributes: prompt.payload.clientAttributes,
  });

  return (
    <SduiFeatureEntryPoint
      configKey={configKey}
      identifier={prompt.payload.promptEntry.identifier}
      services={getSduiServices(appPage)}
      shouldDisplayLoading={false}
      shouldDisplayError={false}
    />
  );
};
