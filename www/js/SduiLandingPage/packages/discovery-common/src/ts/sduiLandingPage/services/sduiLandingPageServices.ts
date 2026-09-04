import type { TranslateFunction } from "@rbx/core-scripts/react";
import {
  composeSduiRegistries,
  getOrCreatePageServices,
  SduiCommonModule,
  type SduiServices,
} from "@rbx/sdui-core";
import { createSduiCsrTelemetry, SduiClientModule } from "@rbx/sdui-client";
import type { PageContext } from "../../common/types/pageContext";
import { DiscoverySduiModule } from "../../sdui/v2/discoverySduiModule";

const telemetry = createSduiCsrTelemetry();

// The module set and its precedence are properties of this application, not
// of any one surface or React subtree, so composition runs once at module load
// and the resulting locked registries are shared.
const registries = composeSduiRegistries(
  [DiscoverySduiModule, SduiClientModule, SduiCommonModule],
  { errorReporter: telemetry.errorReporter },
);

/**
 * Resolve the page-scoped SDUI service graph for a landing page surface.
 *
 * Services are keyed by `appPage`, so every mount point on a surface shares
 * one hydration/template/API cache. The first caller for a surface fixes the
 * `translate` function for that graph's lifetime.
 */
export function getSduiLandingPageServices(
  appPage: PageContext,
  translate?: TranslateFunction,
): SduiServices {
  return getOrCreatePageServices(appPage, {
    componentRegistry: registries.componentRegistry,
    actionHandlerRegistry: registries.actionHandlerRegistry,
    telemetryHandlerNameRegistry: registries.telemetryHandlerNameRegistry,
    impressionHandlerRegistry: registries.impressionHandlerRegistry,
    analyticsReporter: telemetry.analyticsReporter,
    errorReporter: telemetry.errorReporter,
    pageContext: { pageName: appPage, appPage },
    translate,
  });
}
