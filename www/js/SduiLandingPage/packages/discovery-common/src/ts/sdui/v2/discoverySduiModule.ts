import type { SduiRegistryModule } from "@rbx/sdui-core";
import { DISCOVERY_ACTION_HANDLERS } from "./actions/discoveryActionHandlers";
import { DISCOVERY_V2_COMPONENTS } from "./components/discoverySduiComponents";
import { DISCOVERY_IMPRESSION_HANDLERS } from "./impressions/discoveryImpressionHandlers";

export const DiscoverySduiModule = {
  name: "discovery-common",
  components: DISCOVERY_V2_COMPONENTS,
  actionHandlers: DISCOVERY_ACTION_HANDLERS,
  impressionHandlers: DISCOVERY_IMPRESSION_HANDLERS,
} satisfies SduiRegistryModule;
