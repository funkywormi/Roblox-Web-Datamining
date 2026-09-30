import { LegallySensitiveContentService } from "Roblox";
import {
  startWizard,
  type FlowExitResult,
  type UseLegallySensitiveContent,
} from "@rbx/amp-v2-wizard";
import type { TranslateFunction } from "@rbx/core-scripts/react";

const VPC_FLOW_NAME = "VPC";
const PARENT_LINK_SURFACE = "StandaloneParentLink";
const CREATE_ODP_REQUEST_TYPE = "CreateODP";

/**
 * The remote-request node cancels the run when this wiring is missing, including on the on-device
 * path, which never renders that node.
 */
function parentLinkConfig(translate: TranslateFunction): Record<string, unknown> {
  return {
    remoteParentRequest: {
      translate,
      useLegallySensitiveContent:
        LegallySensitiveContentService.useLegallySensitiveContentAndActions as UseLegallySensitiveContent,
    },
  };
}

/** Email linking. An absent request type is the server's `LinkToChild` route, past the prologue. */
export function startRemoteParentLink(translate: TranslateFunction): Promise<FlowExitResult> {
  return startWizard({
    flow: { name: VPC_FLOW_NAME },
    surface: PARENT_LINK_SURFACE,
    config: parentLinkConfig(translate),
  });
}

/** On-device linking. `CreateODP` is the server's standalone ODP route, past the prologue. */
export function startOnDeviceParentLink(translate: TranslateFunction): Promise<FlowExitResult> {
  return startWizard({
    flow: { name: VPC_FLOW_NAME, props: { requestType: CREATE_ODP_REQUEST_TYPE } },
    surface: PARENT_LINK_SURFACE,
    config: parentLinkConfig(translate),
  });
}
