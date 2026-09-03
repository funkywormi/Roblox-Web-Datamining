import "@rbx/core-scripts/http/core-intercept";
import {
  getOrCreatePageServices,
  type CreateSduiServicesOptions,
  type SduiServices,
} from "@rbx/sdui-core";
import { createSduiCsrTelemetry } from "../telemetry/createSduiCsrTelemetry";

// Supports the CSR interceptor path until SDUI migrates to Next.js' shared interceptor flow
export function getOrCreateSduiClientPageServices(
  pageKey: string,
  options?: CreateSduiServicesOptions,
): SduiServices {
  return getOrCreatePageServices(pageKey, {
    ...createSduiCsrTelemetry(),
    ...options,
  });
}
