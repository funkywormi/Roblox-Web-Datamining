import React, { useEffect } from 'react';
import { withTranslations, WithTranslationsProps } from 'react-utilities';
import { createModal } from 'react-style-guide';
import { groupsConfig } from '../../translation.config';
import groupMembershipService from '../../services/groupMembershipService';
import ModerateUserDialogBase from './base/ModerateUserDialogBase';
import { useModerateDialog } from '../../contexts/ModerateDialogContext';

const BanUserModal = ({ translate }: WithTranslationsProps): JSX.Element | null => {
  const { dialogState, closeBanDialog } = useModerateDialog();
  const [BanModal, modalService] = createModal();

  useEffect(() => {
    if (dialogState.userId && dialogState.groupId && dialogState.type === 'ban') {
      modalService.open();
    } else {
      modalService.close();
    }
  }, [modalService, dialogState.userId, dialogState.groupId, dialogState.type]);

  const banUserAction = async () => {
    if (dialogState?.userId && dialogState?.groupId) {
      await groupMembershipService.banUserFromGroup(dialogState.groupId, dialogState.userId);
    }
  };

  return (
    <ModerateUserDialogBase
      dialogComponent={BanModal}
      title={translate('Label.Warning')}
      bodyText={translate('Description.BanUserWarning')}
      successText={translate('Message.BanUserSuccess')}
      actionButtonText={translate('Action.Ban')}
      moderateUserAction={banUserAction}
      translate={translate}
      closeDialog={closeBanDialog}
    />
  );
};

export default withTranslations(BanUserModal, groupsConfig);
