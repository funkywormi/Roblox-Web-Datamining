import "@rbx/core-scripts/http/core-intercept";
import { composeSduiRegistries, getOrCreatePageServices, SduiCommonModule } from "@rbx/sdui-core";
import { createSduiCsrTelemetry, SduiClientModule } from "@rbx/sdui-client";
import type { AppPage } from "../constants/pageConstants";
import { getSduiPageContext } from "../utils/sduiUtils";
import { PromptsSduiModule } from "../registry/promptsSduiModule";

const telemetry = createSduiCsrTelemetry();
const registries = composeSduiRegistries([PromptsSduiModule, SduiClientModule, SduiCommonModule], {
  errorReporter: telemetry.errorReporter,
});

export const getSduiServices = (appPage: AppPage) => {
  return getOrCreatePageServices(appPage, {
    pageContext: getSduiPageContext(appPage),
    componentRegistry: registries.componentRegistry,
    actionHandlerRegistry: registries.actionHandlerRegistry,
    telemetryHandlerNameRegistry: registries.telemetryHandlerNameRegistry,
    impressionHandlerRegistry: registries.impressionHandlerRegistry,
    analyticsReporter: telemetry.analyticsReporter,
    errorReporter: telemetry.errorReporter,
  });
};

export const getSduiApiStore = (appPage: AppPage) => {
  return getSduiServices(appPage).apiStore;
};

export const getSduiAnalyticsReporter = (appPage: AppPage) => {
  return getSduiServices(appPage).analyticsReporter;
};
