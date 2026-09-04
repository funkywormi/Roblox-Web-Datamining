import { DEFAULT_ACTION_HANDLERS } from "./defaultActionHandlers";
import { DEFAULT_COMPONENTS } from "./defaultComponents";
import type { SduiRegistryModule } from "./SduiRegistryModule";

export const SduiCommonModule = {
  name: "sdui-common",
  components: DEFAULT_COMPONENTS,
  actionHandlers: DEFAULT_ACTION_HANDLERS,
} satisfies SduiRegistryModule;
