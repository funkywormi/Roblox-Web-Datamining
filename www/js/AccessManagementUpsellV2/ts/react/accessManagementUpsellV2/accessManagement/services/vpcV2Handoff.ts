import { Guac } from 'Roblox';
import { startWizard } from '@rbx/amp-v2-wizard';
import { Recourse, ReportEvent } from '../../enums';
import reportEvent from '../../services/reportEventService';
import { TVpcV2Handoff } from '../../types/AmpTypes';

const VPC_V2_FLOW_NAME = 'VPC';

// WebApps' TypeScript 4.2 cannot parse the package's TypeScript 5 declarations.
type TFlowExit = { reason?: string; flowId?: string };

let cachedPolicyRead: Promise<boolean> | null = null;

function reportFailedExit(recourseAction: Recourse, exit: TFlowExit): void {
  if (exit.reason === undefined || exit.reason === 'Completed' || exit.reason === 'Cancelled') {
    return;
  }
  reportEvent(ReportEvent.VerificationFailed, recourseAction, {
    error: `amp-v2-wizard ${VPC_V2_FLOW_NAME} flow exited as ${exit.reason}`,
    flowId: exit.flowId ?? ''
  });
}

const vpcV2Handoff: TVpcV2Handoff = {
  isEnabled: (): Promise<boolean> => {
    if (cachedPolicyRead === null) {
      cachedPolicyRead = Guac.callBehaviour<{ UseAmpV2WizardForVpc?: boolean | null }>('app-policy')
        .then(policy => policy?.UseAmpV2WizardForVpc === true)
        .catch(() => false);
    }
    return cachedPolicyRead;
  },

  launch: ({ recourseAction, parentConsentTypes, recourseData, onClose }) => {
    startWizard({
      flow: {
        name: VPC_V2_FLOW_NAME,
        props: { recourseAction, consents: parentConsentTypes, recourseData }
      },
      surface: 'AccessManagementUpsell'
    }).then((result: unknown) => {
      reportFailedExit(recourseAction, result as TFlowExit);
      onClose();
    }, onClose);
  }
};

export default vpcV2Handoff;
