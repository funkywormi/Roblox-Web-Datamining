import React, { useEffect } from 'react';
import { withTranslations, WithTranslationsProps } from 'react-utilities';
import { createModal } from 'react-style-guide';
import { groupsConfig } from '../../translation.config';
import groupMembershipService from '../../services/groupMembershipService';
import ModerateUserDialogBase from './base/ModerateUserDialogBase';
import { useModerateDialog } from '../../contexts/ModerateDialogContext';

const KickUserModal = ({ translate }: WithTranslationsProps): JSX.Element | null => {
  const { dialogState, closeKickDialog } = useModerateDialog();
  const [KickModal, modalService] = createModal();

  useEffect(() => {
    if (dialogState.userId && dialogState.groupId && dialogState.type === 'kick') {
      modalService.open();
    } else {
      modalService.close();
    }
  }, [modalService, dialogState.userId, dialogState.groupId, dialogState.type]);

  const kickUserAction = async () => {
    if (dialogState?.userId && dialogState?.groupId) {
      await groupMembershipService.kickUserFromGroup(dialogState.groupId, dialogState.userId);
    }
  };

  return (
    <ModerateUserDialogBase
      title={translate('Label.Warning')}
      bodyText={translate('Description.KickUserWarning')}
      successText={translate('Message.KickUserSuccess')}
      actionButtonText={translate('Action.Kick')}
      moderateUserAction={kickUserAction}
      translate={translate}
      closeDialog={closeKickDialog}
      dialogComponent={KickModal}
    />
  );
};

export default withTranslations(KickUserModal, groupsConfig);
