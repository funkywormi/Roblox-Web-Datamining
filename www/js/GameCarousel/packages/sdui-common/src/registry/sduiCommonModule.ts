import type { SduiRegistryModule } from "@rbx/sdui-core";
import { DEFAULT_ACTION_HANDLERS } from "./defaultActionHandlers";
import { DEFAULT_COMPONENTS } from "./defaultComponents";

export const SduiCommonModule = {
  name: "sdui-common",
  components: DEFAULT_COMPONENTS,
  actionHandlers: DEFAULT_ACTION_HANDLERS,
} satisfies SduiRegistryModule;
