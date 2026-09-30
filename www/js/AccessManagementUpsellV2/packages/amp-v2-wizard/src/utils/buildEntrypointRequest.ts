/**
 * Builds the /entrypoint request. Shared by the availability probe (useAmpUpsell) and the launch
 * path (WizardApp) so the request shape stays identical however the wizard starts.
 */

import { getDeviceMeta } from "@rbx/core-scripts/meta/device";
import { capabilities } from "../componentRegistry";
import type { FlowEntrypointRequest, FlowSelector, Registry, Target } from "../types";

export function buildEntrypointRequest(
  target: Target | undefined,
  flow: FlowSelector | undefined,
  surface: string,
  registry: Registry | undefined,
  extraProps: Record<string, unknown> | undefined,
): FlowEntrypointRequest {
  const isWebview = getDeviceMeta()?.isInApp === true;
  const clientCapabilities = capabilities(registry).filter(
    capability => capability !== "DeeplinkRedirect" || isWebview,
  );
  return {
    target,
    flow,
    surface,
    client: { clientCapabilities },
    extraProps: clientCapabilities.includes("DeeplinkRedirect")
      ? {
          ...extraProps,
          returnPage: `${window.location.pathname.slice(1) || "home"}${window.location.search}${window.location.hash}`,
        }
      : extraProps,
  };
}
