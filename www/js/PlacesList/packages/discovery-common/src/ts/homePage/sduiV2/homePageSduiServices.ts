import type { TranslateFunction } from "@rbx/core-scripts/react";
import { composeSduiRegistries, getOrCreatePageServices, type SduiServices } from "@rbx/sdui-core";
import { createSduiCsrTelemetry, SduiClientModule } from "@rbx/sdui-client";
import { SduiCommonModule } from "@rbx/sdui-common";
import { EventContext } from "@rbx/unified-logging";
import { DiscoverySduiModule } from "../../sdui/v2/discoverySduiModule";
import { GameTileFeedbackSduiModule } from "../../sdui/v2/gameTileFeedbackSduiModule";
import { HOME_APP_PAGE, getHomePageKey } from "./homePageConfiguration";
import { HomeFriendsSduiModule } from "./homeFriendsSduiModule";
import { HomeSduiModule } from "./homeSduiModule";

const telemetry = createSduiCsrTelemetry();

const homeRegistries = composeSduiRegistries(
  [
    HomeSduiModule,
    HomeFriendsSduiModule,
    GameTileFeedbackSduiModule,
    DiscoverySduiModule,
    SduiClientModule,
    SduiCommonModule,
  ],
  { errorReporter: telemetry.errorReporter },
);

export function getHomePageSduiServices(translate: TranslateFunction): SduiServices {
  return getOrCreatePageServices(getHomePageKey(), {
    componentRegistry: homeRegistries.componentRegistry,
    actionHandlerRegistry: homeRegistries.actionHandlerRegistry,
    telemetryHandlerNameRegistry: homeRegistries.telemetryHandlerNameRegistry,
    impressionHandlerRegistry: homeRegistries.impressionHandlerRegistry,
    analyticsReporter: telemetry.analyticsReporter,
    errorReporter: telemetry.errorReporter,
    observeWebVitals: telemetry.observeWebVitals,
    pageLoadPlatformAdapter: telemetry.pageLoadPlatformAdapter,
    pageContext: { pageName: HOME_APP_PAGE, appPage: EventContext.Home },
    translate,
  });
}
