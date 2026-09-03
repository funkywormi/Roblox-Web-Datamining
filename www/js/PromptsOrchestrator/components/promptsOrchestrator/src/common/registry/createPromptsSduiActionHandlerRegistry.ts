import { createSduiClientActionHandlerRegistry } from "@rbx/sdui-client";
import type { SduiActionHandlerRegistry } from "@rbx/sdui-core";
import { PROMPTS_ACTION_HANDLERS } from "./actions/promptsActionHandlers";

export function createPromptsSduiActionHandlerRegistry(): SduiActionHandlerRegistry {
  return createSduiClientActionHandlerRegistry(PROMPTS_ACTION_HANDLERS);
}
