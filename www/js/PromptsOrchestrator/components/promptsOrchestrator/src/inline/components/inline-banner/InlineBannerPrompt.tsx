import { SduiFeatureEntryPoint } from "@rbx/sdui-core/client";
import { usePromptImpressionEmitter } from "../../../common/hooks/usePromptImpressionEmitter";
import type { InlinePromptEntryPoint } from "../../../common/constants/promptEntryPointConstants";
import type { ClientAttributes } from "../../../common/types/promptTypes";
import { useInlineBannerPrompt } from "./useInlineBannerPrompt";

export type InlineBannerPromptProps = {
  entryPoint: InlinePromptEntryPoint;
  clientAttributes?: ClientAttributes;
};

export const InlineBannerPrompt = ({ entryPoint, clientAttributes }: InlineBannerPromptProps) => {
  const { promptEntry, appPage, configKey } = useInlineBannerPrompt({
    entryPoint,
    clientAttributes,
  });

  const isPromptEnabled = promptEntry !== undefined;

  usePromptImpressionEmitter({
    enabled: isPromptEnabled,
    appPage,
    promptType: promptEntry?.title,
    promptId: promptEntry?.identifier,
    clientAttributes,
  });

  if (!isPromptEnabled) {
    return null;
  }

  return (
    <SduiFeatureEntryPoint
      configKey={configKey}
      identifier={promptEntry.identifier}
      appPage={appPage}
      shouldDisplayLoading={false}
      shouldDisplayError={false}
    />
  );
};
