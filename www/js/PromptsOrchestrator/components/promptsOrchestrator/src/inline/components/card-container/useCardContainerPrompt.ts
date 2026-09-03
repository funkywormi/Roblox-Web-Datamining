import { PromptStyle } from "../../../common/constants/promptStyleConstants";
import { usePromptEntries } from "../../../common/hooks/usePromptEntries";
import { getSurfaceRequestConfig } from "../../../common/utils/surfaceRequestUtils";
import type { InlinePromptEntryPoint } from "../../../common/constants/promptEntryPointConstants";
import type { AppPage } from "../../../common/constants/pageConstants";
import type { ClientAttributes, PromptEntry } from "../../../common/types/promptTypes";

const PROMPT_STYLES = [PromptStyle.CardContainer] as const;

export type UseCardContainerPromptInput = {
  entryPoint: InlinePromptEntryPoint;
  clientAttributes?: ClientAttributes;
};

export type UseCardContainerPromptResult = {
  promptEntry?: PromptEntry;
  appPage: AppPage;
  configKey: string;
};

export const useCardContainerPrompt = ({
  entryPoint,
  clientAttributes,
}: UseCardContainerPromptInput): UseCardContainerPromptResult => {
  const { configKey, surfaceKey, appPage } = getSurfaceRequestConfig(entryPoint, clientAttributes);

  const promptEntries = usePromptEntries({
    entryPoint,
    surfaceKey,
    configKey,
    clientAttributes,
    promptStyles: PROMPT_STYLES,
    appPage,
  });

  return {
    promptEntry: promptEntries[PromptStyle.CardContainer][0],
    appPage,
    configKey,
  };
};
