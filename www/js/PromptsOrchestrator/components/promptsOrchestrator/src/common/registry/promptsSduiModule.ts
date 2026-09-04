import type { SduiRegistryModule } from "@rbx/sdui-core";
import { PROMPTS_ACTION_HANDLERS } from "./actions/promptsActionHandlers";

export const PromptsSduiModule = {
  name: "prompts-orchestrator",
  actionHandlers: PROMPTS_ACTION_HANDLERS,
} satisfies SduiRegistryModule;
