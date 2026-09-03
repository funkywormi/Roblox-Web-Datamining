import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { WithTranslationsProps } from 'react-utilities';
import useParentEmailModal from '../hooks/useParentEmailModal';
import RequestType from '../enums/RequestType';
import { sendInitialUpsellPageLoadEvent } from '../../../accessManagement/constants/eventConstants';
import { selectFeatureName } from '../../../accessManagement/accessManagementSlice';
import parentalRequestConstants from '../constants/parentalRequestConstants';

const ParentEmailModal = ({
  translate,
  consentType,
  successCallback,
  onHidecallback,
  isPrologueUsed,
  value,
  source
}: {
  translate: WithTranslationsProps['translate'];
  consentType: RequestType;
  successCallback: (sessionId: string, newParentEmail?: string, emailNotSent?: boolean) => any;
  onHidecallback: () => any;
  isPrologueUsed: boolean;
  value: Record<string, unknown> | null;
  source?: string;
}): JSX.Element => {
  const featureName = useSelector(selectFeatureName);
  const [parentEmailModal, parentEmailModalService] = useParentEmailModal(
    translate,
    consentType,
    successCallback,
    onHidecallback,
    value,
    source
  );
  useEffect(() => {
    if (!isPrologueUsed) {
      // prologue is not used
      // we need to send the modal pageload event here
      const settingName = Object.keys(value)[0];
      sendInitialUpsellPageLoadEvent(
        featureName,
        parentalRequestConstants.events.vpc,
        settingName,
        value as Record<string, string>
      );
    }
    parentEmailModalService.open();
  }, []);
  return <React.Fragment>{parentEmailModal}</React.Fragment>;
};

export default ParentEmailModal;
