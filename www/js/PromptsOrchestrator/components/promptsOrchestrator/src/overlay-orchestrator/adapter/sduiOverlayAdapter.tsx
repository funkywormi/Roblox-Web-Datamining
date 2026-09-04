import { OverlayRenderer, type SduiOverlayRenderer } from "../types";
import { type RendererAdapterProps } from "./types";
import { DialogPromptAdapter } from "./dialogPromptAdapter";
import { useSduiOverlayLifecycle } from "./useSduiOverlayLifecycle";

export const SduiOverlayAdapter = ({ prompt }: RendererAdapterProps<SduiOverlayRenderer>) => {
  const { configKey, appPage } = prompt.payload;

  const isPromptInCache = useSduiOverlayLifecycle({
    prompt,
    appPage,
    configKey,
    promptIdentifier: prompt.payload.promptEntry.identifier,
  });

  if (!isPromptInCache) {
    return null;
  }

  switch (prompt.renderer) {
    // disable for now to establish the pattern. new sdui prompt types will be
    // added later and this eslint disable should be removed
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    case OverlayRenderer.DialogPrompt:
      return <DialogPromptAdapter prompt={prompt} />;
    default:
      return null;
  }
};
