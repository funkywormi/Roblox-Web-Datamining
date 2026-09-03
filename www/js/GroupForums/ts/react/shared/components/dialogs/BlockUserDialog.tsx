import React, { useEffect } from 'react';
import { withTranslations, WithTranslationsProps } from 'react-utilities';
import { createModal, useSystemFeedback } from 'react-style-guide';
import { groupsConfig } from '../../translation.config';
import userBlockingService from '../../services/userBlockingService';
import { useModerateDialog } from '../../contexts/ModerateDialogContext';
import useForumStore from '../../../groupForums/hooks/useForumStore';

const BlockUserModal = ({ translate }: WithTranslationsProps): JSX.Element | null => {
  const { dialogState, closeBlockDialog } = useModerateDialog();
  const [BlockModal, modalService] = createModal();
  const blockUser = useForumStore.use.blockUser();

  const { systemFeedbackService } = useSystemFeedback();

  useEffect(() => {
    if (dialogState.userId && dialogState.type === 'block') {
      modalService.open();
    } else {
      modalService.close();
    }
  }, [modalService, dialogState.userId, dialogState.type]);

  if (!dialogState.userId || dialogState.type !== 'block') {
    return null;
  }

  const blockUserAction = async () => {
    if (dialogState?.userId) {
      try {
        await userBlockingService.blockUser(dialogState.userId);
        systemFeedbackService.success(translate('Message.BlockUserSuccess'));
        blockUser(dialogState.userId);
      } catch (e) {
        systemFeedbackService.warning(translate('NetworkError'));
      }

      closeBlockDialog();
    }
  };

  const hideUserBlockModal = () => {
    closeBlockDialog();
  };

  return (
    <BlockModal
      footerText={translate('Description.BlockUserFooterDialog')}
      title={translate('Heading.BlockUserWarning')}
      onClose={hideUserBlockModal}
      body={translate('Description.BlockUserWarning')}
      actionButtonShow
      actionButtonText={translate('Action.BlockUser')}
      onAction={blockUserAction}
      neutralButtonText={translate('Action.Cancel')}
      onNeutral={hideUserBlockModal}
    />
  );
};

export default withTranslations(BlockUserModal, groupsConfig);
