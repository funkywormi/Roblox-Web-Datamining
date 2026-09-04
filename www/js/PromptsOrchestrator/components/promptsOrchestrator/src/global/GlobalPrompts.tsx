import { useEffect } from "react";
import { type GlobalPromptEntryPoint } from "../common/constants/promptEntryPointConstants";
import type { ClientAttributes } from "../common/types/promptTypes";
import { useGlobalPromptsStore } from "./store/globalPromptsStore";
import {
  selectClientAttributes,
  selectEntryPoint,
} from "./store/globalPromptContext/globalPromptContextSelectors";
import { useGlobalPromptNavigation } from "./hooks/useGlobalPromptNavigation";
import { getSurfaceRequestConfig } from "../common/utils/surfaceRequestUtils";
import { OverlayRenderer } from "../overlay-orchestrator/types";
import { submitPrompt } from "../overlay-orchestrator/scheduler/submitPrompt";
import { GLOBAL_PROMPT_STYLES } from "../common/constants/promptStyleConstants";
import { usePromptEntries } from "../common/hooks/usePromptEntries";

type BaseGlobalPromptsProps = {
  entryPoint: GlobalPromptEntryPoint;
  clientAttributes?: ClientAttributes;
};

const BaseGlobalPrompts = ({ entryPoint, clientAttributes }: BaseGlobalPromptsProps) => {
  const { configKey, surfaceKey, appPage } = getSurfaceRequestConfig(entryPoint, clientAttributes);
  const promptEntries = usePromptEntries({
    entryPoint,
    surfaceKey,
    configKey,
    clientAttributes,
    promptStyles: GLOBAL_PROMPT_STYLES,
    appPage,
  });

  const modalEntry = promptEntries.Modal[0];
  useEffect(() => {
    if (modalEntry) {
      submitPrompt({
        dedupeKey: `prompts-service:${entryPoint}`,
        dedupePolicy: "session",
        renderer: OverlayRenderer.DialogPrompt,
        triggerType: "prompts-service",
        payload: {
          promptEntry: modalEntry,
          configKey,
          appPage,
          clientAttributes,
        },
      });
    }

    // The config key is a string that combines the entry point and client
    // attributes. It's more stable than using the actual clientAttributes object
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modalEntry, configKey]);

  const surfaceBanner = promptEntries.SurfaceBanner[0];
  // TODO: Render the surface banner
  return surfaceBanner ? <div data-testid="global-prompts" /> : null;
};

// This is a wrapper around BaseGlobalPrompts that ensures the entry point is set
export const GlobalPrompts = () => {
  const entryPoint = useGlobalPromptsStore(selectEntryPoint);
  const clientAttributes = useGlobalPromptsStore(selectClientAttributes);

  useGlobalPromptNavigation();

  // Only render on supported entry points
  return entryPoint ? (
    <BaseGlobalPrompts entryPoint={entryPoint} clientAttributes={clientAttributes} />
  ) : null;
};
