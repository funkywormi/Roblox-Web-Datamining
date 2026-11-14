import type { TranslateFunction } from "@rbx/core-scripts/react";
import {
  composeSduiRegistries,
  createSduiServices,
  getOrCreatePageServices,
  type CreateSduiServicesOptions,
  type SduiServices,
} from "@rbx/sdui-core";
import { createSduiCsrTelemetry, SduiClientModule } from "@rbx/sdui-client";
import { SduiCommonModule } from "@rbx/sdui-common";
import type { PageContext } from "@rbx/discovery-common/telemetry";
import { DiscoverySduiModule } from "@rbx/discovery-common/sdui";

const telemetry = createSduiCsrTelemetry();

// The module set and its precedence are properties of this application, not
// of any one surface or React subtree, so composition runs once at module load
// and the resulting locked registries are shared.
const registries = composeSduiRegistries(
  [DiscoverySduiModule, SduiClientModule, SduiCommonModule],
  { errorReporter: telemetry.errorReporter },
);

const servicesOptions = (
  appPage: PageContext,
  translate?: TranslateFunction,
): CreateSduiServicesOptions => ({
  componentRegistry: registries.componentRegistry,
  actionHandlerRegistry: registries.actionHandlerRegistry,
  telemetryHandlerNameRegistry: registries.telemetryHandlerNameRegistry,
  impressionHandlerRegistry: registries.impressionHandlerRegistry,
  analyticsReporter: telemetry.analyticsReporter,
  errorReporter: telemetry.errorReporter,
  observeWebVitals: telemetry.observeWebVitals,
  pageLoadPlatformAdapter: telemetry.pageLoadPlatformAdapter,
  pageContext: { pageName: appPage, appPage },
  translate,
});

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
  return getOrCreatePageServices(appPage, servicesOptions(appPage, translate));
}

/**
 * A new SDUI service graph for a landing page surface, not shared or kept. For Next.js, where
 * client-side navigation keeps modules alive: the shared graph would keep the first locale's data
 * and `translate` after a language switch.
 */
export function createSduiLandingPageServices(
  appPage: PageContext,
  translate?: TranslateFunction,
): SduiServices {
  return createSduiServices(servicesOptions(appPage, translate));
}
