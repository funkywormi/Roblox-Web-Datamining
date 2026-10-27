import { SduiFeatureEntryPoint } from "@rbx/sdui-core/client";
import { getSduiServices } from "../../common/services/sduiServices";
import type { ClientAttributes, PromptEntry } from "../../common/types/promptTypes";
import { useStickySurfaceBanner } from "../hooks/useStickySurfaceBanner";
import type { AppPage } from "../../common/constants/pageConstants";
import { usePromptImpressionEmitter } from "../../common/hooks/usePromptImpressionEmitter";
import { useGlobalPromptsLayoutUpdater } from "../hooks/useGlobalPromptsLayoutUpdater";

type SurfaceBannerProps = {
  promptEntry: PromptEntry;
  appPage: AppPage;
  configKey: string;
  clientAttributes?: ClientAttributes;
};

export const SurfaceBanner = ({
  promptEntry,
  appPage,
  configKey,
  clientAttributes,
}: SurfaceBannerProps) => {
  // TODO: When a surface onboarded with prompts needs sticky functionality,
  // move this hook to GlobalPrompts
  useGlobalPromptsLayoutUpdater(appPage);
  useStickySurfaceBanner();

  usePromptImpressionEmitter({
    enabled: true,
    appPage,
    promptType: promptEntry.title,
    promptId: promptEntry.identifier,
    clientAttributes,
  });

  return (
    <SduiFeatureEntryPoint
      configKey={configKey}
      identifier={promptEntry.identifier}
      services={getSduiServices(appPage)}
      shouldDisplayLoading={false}
      shouldDisplayError={false}
    />
  );
};
