import type { SduiRegistryModule } from "@rbx/sdui-core";
import { DEFAULT_CLIENT_ACTION_HANDLERS } from "./defaultActionHandlers";
import { DEFAULT_CLIENT_COMPONENTS } from "./defaultComponents";
import { DEFAULT_CLIENT_TELEMETRY_HANDLERS } from "./defaultTelemetryHandlers";

export const SduiClientModule = {
  name: "sdui-client",
  components: DEFAULT_CLIENT_COMPONENTS,
  actionHandlers: DEFAULT_CLIENT_ACTION_HANDLERS,
  telemetryHandlers: DEFAULT_CLIENT_TELEMETRY_HANDLERS,
} satisfies SduiRegistryModule;
