import React, { useEffect, useMemo } from 'react';
import { withTranslations, WithTranslationsProps } from 'react-utilities';
import { createModal, useSystemFeedback } from 'react-style-guide';
import { groupsConfig } from '../../translation.config';
import { useModerateDialog } from '../../contexts/ModerateDialogContext';
import forumsService from '../../../groupForums/services/forumsService';

const HideForumEntityModal = ({ translate }: WithTranslationsProps): JSX.Element | null => {
  const { dialogState, closeHideDialog } = useModerateDialog();
  const [HideModal, modalService] = createModal();
  const { systemFeedbackService } = useSystemFeedback();

  const { groupId, categoryId, postId, threadId, commentId, type, onHideSuccess } = dialogState;
  const isHidePost = type === 'hidePost';
  const isHideComment = type === 'hideComment';

  const shouldShow = useMemo(() => {
    const isValidType = isHidePost || isHideComment;
    const isParamsDefined = !!groupId && !!categoryId && !!postId && !!threadId && !!commentId;
    return isValidType && isParamsDefined;
  }, [isHideComment, isHidePost, groupId, categoryId, postId, threadId, commentId]);

  useEffect(() => {
    if (shouldShow) {
      modalService.open();
    } else {
      modalService.close();
    }
  }, [modalService, shouldShow]);

  if (!shouldShow) {
    return null;
  }

  const actionButtonText = translate('Action.Hide');

  const bodyText = isHidePost
    ? translate('Label.HidePostConfirmation')
    : translate('Label.HideCommentConfirmation');

  const footerText = isHidePost
    ? translate('Description.HidePostConfirmationFooter')
    : translate('Description.HideCommentConfirmationFooter');

  const handleHide = async () => {
    if (!groupId || !categoryId || !postId || !threadId || !commentId) return;

    // Close immediately so the UI can update right away.
    closeHideDialog();

    try {
      // hide is implemented as "hide forum comment" (post uses root comment id)
      await forumsService.hideForumComment(groupId, categoryId, postId, threadId, commentId);
      systemFeedbackService.success(
        isHidePost ? translate('Response.PostHidden') : translate('Response.CommentHidden')
      );
      if (onHideSuccess) {
        await onHideSuccess();
      }
    } catch {
      systemFeedbackService.warning(translate('NetworkError'));
    }
  };

  return (
    <HideModal
      title={translate('Label.Warning')}
      onClose={closeHideDialog}
      body={bodyText}
      footerText={footerText}
      actionButtonShow
      actionButtonText={actionButtonText}
      onAction={handleHide}
      neutralButtonText={translate('Action.Cancel')}
      onNeutral={closeHideDialog}
    />
  );
};

export default withTranslations(HideForumEntityModal, groupsConfig);
