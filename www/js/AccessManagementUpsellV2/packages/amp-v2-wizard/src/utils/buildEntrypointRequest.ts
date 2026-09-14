/**
 * Builds the /entrypoint request. Shared by the availability probe (useAmpUpsell) and the launch
 * path (WizardApp) so the request shape stays identical however the wizard starts.
 */

import { capabilities } from "../componentRegistry";
import type { FlowEntrypointRequest, FlowSelector, Registry, Target } from "../types";

export function buildEntrypointRequest(
  target: Target | undefined,
  flow: FlowSelector | undefined,
  surface: string,
  registry: Registry | undefined,
  extraProps: Record<string, unknown> | undefined,
): FlowEntrypointRequest {
  return {
    target,
    flow,
    surface,
    client: { clientCapabilities: capabilities(registry) },
    extraProps,
  };
}
