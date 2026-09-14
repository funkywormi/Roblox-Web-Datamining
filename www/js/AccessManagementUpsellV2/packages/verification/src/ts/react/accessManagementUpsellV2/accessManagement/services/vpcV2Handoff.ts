import { Guac, LegallySensitiveContentService } from 'Roblox';
import { startWizard, type UseLegallySensitiveContent } from '@rbx/amp-v2-wizard';
import { Recourse, ReportEvent } from '../../enums';
import reportEvent from '../../services/reportEventService';
import { TVpcPrologueCopy, TVpcV2Handoff } from '../../types/AmpTypes';

const VPC_V2_FLOW_NAME = 'VPC';

// WebApps' TypeScript 4.2 cannot parse the package's TypeScript 5 declarations.
type TFlowExit = { reason?: string; flowId?: string };

type TAppPolicy = {
  UseAmpV2WizardForVpc?: boolean | null;
  // Request types rolled back to the v1 wizard even when UseAmpV2WizardForVpc is true.
  AmpV2VpcExcludedRequestTypes?: string[] | null;
};

let cachedPolicyRead: Promise<boolean> | null = null;
let cachedExcludedRequestTypesRead: Promise<string[]> | null = null;

function reportFailedExit(recourseAction: Recourse, exit: TFlowExit): void {
  if (exit.reason === undefined || exit.reason === 'Completed' || exit.reason === 'Cancelled') {
    return;
  }
  reportEvent(ReportEvent.VerificationFailed, recourseAction, {
    error: `amp-v2-wizard ${VPC_V2_FLOW_NAME} flow exited as ${exit.reason}`,
    flowId: exit.flowId ?? ''
  });
}

function buildExtraProps(
  usePrologue: boolean,
  prologueCopy?: TVpcPrologueCopy
): Record<string, unknown> {
  const extraProps: Record<string, unknown> = { usePrologue };

  if (prologueCopy) {
    const copy: Record<string, string> = {};
    if (prologueCopy.title) {
      copy.title = prologueCopy.title;
    }
    if (prologueCopy.description) {
      copy.description = prologueCopy.description;
    }
    if (prologueCopy.confirmLabel) {
      copy.confirmLabel = prologueCopy.confirmLabel;
    }
    if (Object.keys(copy).length > 0) {
      extraProps.prologueCopy = copy;
    }
  }

  return extraProps;
}

const vpcV2Handoff: TVpcV2Handoff = {
  isEnabled: (): Promise<boolean> => {
    if (cachedPolicyRead === null) {
      cachedPolicyRead = Guac.callBehaviour<TAppPolicy>('app-policy')
        .then(policy => policy?.UseAmpV2WizardForVpc === true)
        .catch(() => false);
    }
    return cachedPolicyRead;
  },

  getExcludedRequestTypes: (): Promise<string[]> => {
    if (cachedExcludedRequestTypesRead === null) {
      cachedExcludedRequestTypesRead = Guac.callBehaviour<TAppPolicy>('app-policy')
        .then(policy => policy?.AmpV2VpcExcludedRequestTypes ?? [])
        .catch(() => []);
    }
    return cachedExcludedRequestTypesRead;
  },

  launch: ({
    recourseAction,
    parentConsentTypes,
    translate,
    requestType,
    requestDetails,
    onClose,
    usePrologue,
    prologueCopy
  }) => {
    startWizard({
      flow: {
        name: VPC_V2_FLOW_NAME,
        props: { requestType, requestDetails }
      },
      surface: 'AccessManagementUpsell',
      extraProps: buildExtraProps(usePrologue, prologueCopy),
      config: {
        remoteParentRequest: {
          translate,
          useLegallySensitiveContent:
            LegallySensitiveContentService.useLegallySensitiveContentAndActions as UseLegallySensitiveContent,
          launchAction: recourseAction,
          launchConsents: parentConsentTypes,
          launchRecourseData: requestDetails
        }
      }
    }).then((result: unknown) => {
      reportFailedExit(recourseAction, result as TFlowExit);
      onClose();
    }, onClose);
  }
};

export default vpcV2Handoff;
