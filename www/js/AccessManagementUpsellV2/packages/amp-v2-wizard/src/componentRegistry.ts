/**
 * Maps a server node `type` to its component. The keys are the client's capability contract:
 * `capabilities()` advertises them on /entrypoint so the backend only emits nodes we can render.
 */

import { CreateOdpSessionNode } from "./components/nodes/CreateOdpSessionNode";
import { OdpAgeEstimationNode } from "./components/nodes/OdpAgeEstimationNode";
import { OdpGovernmentIdNode } from "./components/nodes/OdpGovernmentIdNode";
import { OdpHandoffNode } from "./components/nodes/OdpHandoffNode";
import { PinEntryNode } from "./components/nodes/PinEntryNode";
import { RedirectNode } from "./components/nodes/RedirectNode";
import { RemoteParentRequestNode } from "./components/nodes/createRemoteParentRequestNode";
import { SessionPollingNode } from "./components/nodes/SessionPollingNode";
import { TextScreenNode } from "./components/nodes/TextScreenNode";
import { UserAgreementNode } from "./components/nodes/UserAgreementNode";
import { VerificationMethodSelectionNode } from "./components/nodes/VerificationMethodSelectionNode";
import type { NodeComponent, Registry } from "./types";

/** Keys MUST match the backend's node-type discriminators. */
export const defaultRegistry: Registry = {
  CreateOdpSession: CreateOdpSessionNode,
  OdpAgeEstimation: OdpAgeEstimationNode,
  OdpGovernmentId: OdpGovernmentIdNode,
  OdpHandoff: OdpHandoffNode,
  PinEntry: PinEntryNode,
  Redirect: RedirectNode,
  RemoteParentRequest: RemoteParentRequestNode,
  SessionPolling: SessionPollingNode,
  TextScreen: TextScreenNode,
  UserAgreement: UserAgreementNode,
  VerificationMethodSelection: VerificationMethodSelectionNode,
};

export function getNodeComponent(registry: Registry, nodeType: string): NodeComponent | undefined {
  return registry[nodeType];
}

/** Node types to advertise on /entrypoint, sorted for a stable request payload. */
export function capabilities(registry: Registry = defaultRegistry): string[] {
  return Object.keys(registry).sort();
}
