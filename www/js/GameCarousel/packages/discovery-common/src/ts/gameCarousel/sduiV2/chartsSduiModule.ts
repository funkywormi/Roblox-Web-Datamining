import type { SduiRegistryModule } from "@rbx/sdui-core";
import { CHARTS_PAGE_ACTION_HANDLERS } from "./chartsPageActionHandlers";

export const ChartsSduiModule = {
  name: "charts",
  actionHandlers: CHARTS_PAGE_ACTION_HANDLERS,
} satisfies SduiRegistryModule;
