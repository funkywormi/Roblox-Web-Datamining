import type { TranslateFunction } from "@rbx/core-scripts/react";
import { DiscoverySduiModule } from "@rbx/discovery-common/sdui";
import {
  composeSduiRegistries,
  getOrCreatePageServices,
  type SduiRegistries,
  type SduiServices,
} from "@rbx/sdui-core";
import { createSduiCsrTelemetry, SduiClientModule } from "@rbx/sdui-client";
import { SduiCommonModule } from "@rbx/sdui-common";

import { GameSearchSduiModule } from "../registry/gameSearchSduiModule";

export const GAME_SEARCH_MODULES = [
  GameSearchSduiModule,
  DiscoverySduiModule,
  SduiClientModule,
  SduiCommonModule,
];

let telemetry: ReturnType<typeof createSduiCsrTelemetry> | undefined;

let gameSearchRegistries: SduiRegistries | undefined;

// Temporary getter method to avoid creating telemetry/registries on page load
// which will also affect the non-sdui game search. This can be removed either
// when we get lazy loading or game search is migrated to sdui.
const getRegistriesAndTelemetry = () => {
  telemetry = telemetry ?? createSduiCsrTelemetry();

  gameSearchRegistries =
    gameSearchRegistries ??
    composeSduiRegistries(GAME_SEARCH_MODULES, { errorReporter: telemetry.errorReporter });

  return { gameSearchRegistries, telemetry };
};

type GetSduiServicesParams = {
  translate: TranslateFunction;
  pageKey: string;
  appPage: string;
};

export function getSduiServices({
  translate,
  pageKey,
  appPage,
}: GetSduiServicesParams): SduiServices {
  const { gameSearchRegistries, telemetry } = getRegistriesAndTelemetry();

  return getOrCreatePageServices(pageKey, {
    componentRegistry: gameSearchRegistries.componentRegistry,
    actionHandlerRegistry: gameSearchRegistries.actionHandlerRegistry,
    telemetryHandlerNameRegistry: gameSearchRegistries.telemetryHandlerNameRegistry,
    impressionHandlerRegistry: gameSearchRegistries.impressionHandlerRegistry,
    analyticsReporter: telemetry.analyticsReporter,
    errorReporter: telemetry.errorReporter,
    observeWebVitals: telemetry.observeWebVitals,
    pageLoadPlatformAdapter: telemetry.pageLoadPlatformAdapter,
    pageContext: {
      pageName: appPage,
      appPage,
    },
    translate,
  });
}
