import type { InlinePromptEntryPoint } from "../common/constants/promptEntryPointConstants";
import type { ClientAttributes } from "../common/types/promptTypes";
import { getSurfaceRequestConfig } from "../common/utils/surfaceRequestUtils";
import { getSduiApiStore } from "../common/services/sduiServices";

export async function refreshInlinePrompt(
  entryPoint: InlinePromptEntryPoint,
  clientAttributes?: ClientAttributes,
): Promise<void> {
  const { configKey, appPage } = getSurfaceRequestConfig(entryPoint, clientAttributes);
  const apiStore = getSduiApiStore(appPage);
  await apiStore.refreshFromApi(configKey);
}
