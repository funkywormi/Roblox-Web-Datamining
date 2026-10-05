import type { TranslateFunction } from "@rbx/core-scripts/react";
import { composeSduiRegistries, getOrCreatePageServices, type SduiServices } from "@rbx/sdui-core";
import { createSduiCsrTelemetry, SduiClientModule } from "@rbx/sdui-client";
import { SduiCommonModule } from "@rbx/sdui-common";
import { PageContext } from "../../common/types/pageContext";
import { DiscoverySduiModule } from "../../sdui/v2/discoverySduiModule";
import { ChartsSduiModule } from "./chartsSduiModule";
import {
  CHARTS_APP_PAGE,
  getChartsPageKey,
  getChartsSortDetailSurfaceKey,
} from "./chartsPageConfiguration";

const telemetry = createSduiCsrTelemetry();

const chartsRegistries = composeSduiRegistries(
  [ChartsSduiModule, DiscoverySduiModule, SduiClientModule, SduiCommonModule],
  { errorReporter: telemetry.errorReporter },
);

function getChartsSduiServices(
  pageKey: string,
  pageName: string,
  translate: TranslateFunction,
): SduiServices {
  return getOrCreatePageServices(pageKey, {
    componentRegistry: chartsRegistries.componentRegistry,
    actionHandlerRegistry: chartsRegistries.actionHandlerRegistry,
    telemetryHandlerNameRegistry: chartsRegistries.telemetryHandlerNameRegistry,
    impressionHandlerRegistry: chartsRegistries.impressionHandlerRegistry,
    analyticsReporter: telemetry.analyticsReporter,
    errorReporter: telemetry.errorReporter,
    observeWebVitals: telemetry.observeWebVitals,
    pageLoadPlatformAdapter: telemetry.pageLoadPlatformAdapter,
    pageContext: { pageName, appPage: CHARTS_APP_PAGE },
    translate,
  });
}

/** Page-scoped SDUI services for the main Charts feed. Keyed by configKey, matching Lua page scope. */
export function getChartsPageSduiServices(translate: TranslateFunction): SduiServices {
  return getChartsSduiServices(getChartsPageKey(), PageContext.GamesPage, translate);
}

/** Page-scoped SDUI services for Charts See All. Keyed by Lua sort-detail surface, not pageName. */
export function getChartsSeeAllSduiServices(translate: TranslateFunction): SduiServices {
  return getChartsSduiServices(
    getChartsSortDetailSurfaceKey(),
    PageContext.SortDetailPageDiscover,
    translate,
  );
}
