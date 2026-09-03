import React, { useState } from 'react';
import { TranslateFunction, withTranslations } from 'react-utilities';
import { TModalComponent, useSystemFeedback } from 'react-style-guide';
import { useModerateDialog } from '../../../contexts/ModerateDialogContext';
import { useModerateUserPermissions } from '../../../contexts/ModerateUserPermissionsContext';
import { deleteAllForumPostsForUser } from '../../../../groupForums/services/forumsService';
import { groupsConfig } from '../../../translation.config';

type ModerateUserDialogBaseProps = {
  translate: TranslateFunction;
  title: string;
  bodyText: string;
  actionButtonText: string;
  successText: string;
  moderateUserAction: () => Promise<void>;
  closeDialog: () => void;
  dialogComponent: TModalComponent;
};

const DELETE_POSTS_CHECKBOX_ID = 'delete-all-posts-checkbox';

const ModerateUserDialogBase = ({
  translate,
  title,
  bodyText,
  actionButtonText,
  successText,
  moderateUserAction,
  closeDialog,
  dialogComponent: DialogComponent
}: ModerateUserDialogBaseProps): JSX.Element | null => {
  const { dialogState } = useModerateDialog();
  const { groupId, userId, onDeletePosts, onModerationSuccess } = dialogState;
  const [deleteAllPosts, setDeleteAllPosts] = useState(false);
  const { canDeleteAllPosts } = useModerateUserPermissions();
  const { systemFeedbackService } = useSystemFeedback();

  if (!(userId && groupId)) {
    return null;
  }

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDeleteAllPosts(e.target.checked);
  };

  const modalBody = (
    <React.Fragment>
      <p>{bodyText}</p>
      {canDeleteAllPosts && (
        <div style={{ marginTop: '16px' }}>
          <label htmlFor={DELETE_POSTS_CHECKBOX_ID}>
            <input
              id={DELETE_POSTS_CHECKBOX_ID}
              style={{ marginRight: '6px' }}
              type='checkbox'
              checked={deleteAllPosts}
              onChange={handleCheckboxChange}
            />
            {translate('Label.DeleteAllPostsByUser')}
          </label>
        </div>
      )}
    </React.Fragment>
  );

  const handleAction = async () => {
    if (dialogState?.userId && dialogState?.groupId) {
      const requestPromises: Promise<void>[] = [moderateUserAction()];

      if (deleteAllPosts) {
        requestPromises.push(
          deleteAllForumPostsForUser(dialogState.groupId, dialogState.userId).then(() => {
            onDeletePosts?.();
          })
        );
      }

      try {
        await Promise.all(requestPromises);
        systemFeedbackService.success(successText);
        onModerationSuccess?.();
      } catch (e) {
        systemFeedbackService.warning(translate('NetworkError'));
      } finally {
        closeDialog();
      }
    }
  };

  return (
    <DialogComponent
      title={title}
      onClose={closeDialog}
      body={modalBody}
      actionButtonShow
      actionButtonText={actionButtonText}
      onAction={handleAction}
      neutralButtonText={translate('Action.Cancel')}
      onNeutral={closeDialog}
    />
  );
};

export default withTranslations(ModerateUserDialogBase, groupsConfig);
