import { ModalEvent } from '../accessManagement/constants/viewConstants';
import { Access, WizardIntent } from '../enums';
import { TAccessManagementUpsellParams } from '../types/AmpTypes';

const isFeatureAccessGranted = (access: Access) => {
  return access === Access.Granted;
};

export const startAccessManagementUpsell = async ({
  featureName,
  redirectLink = null as unknown as string,
  ampFeatureCheckData = [],
  isAsyncCall = true,
  usePrologue = false,
  ampRecourseData = null,
  featureSpecificData = null as unknown as TAccessManagementUpsellParams['featureSpecificData'],
  namespace = null as unknown as string,
  wizardIntent = null as unknown as WizardIntent
}: TAccessManagementUpsellParams): Promise<boolean> => {
  return new Promise(resolve => {
    const event = new CustomEvent(ModalEvent.StartAccessManagementUpsell, {
      detail: {
        featureName,
        redirectLink,
        ampFeatureCheckData,
        isAsyncCall,
        usePrologue,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        ampRecourseData,
        featureSpecificData,
        namespace,
        wizardIntent,
        closeCallback: (access: Access) => {
          resolve(isFeatureAccessGranted(access));
        }
      }
    });
    window.dispatchEvent(event);
  });
};

export default {
  startAccessManagementUpsell
};
