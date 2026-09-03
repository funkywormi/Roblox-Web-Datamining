import React, { useCallback, useEffect, useRef, useState } from 'react';
import { withTranslations, WithTranslationsProps } from 'react-utilities';
import {
  Button,
  Checkbox,
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogTitle
} from '@rbx/foundation-ui';
import { groupsConfig } from '../../translation.config';
import { useModerateDialog } from '../../contexts/ModerateDialogContext';
import { useCommunityProductFeatures } from '../../contexts/CommunityProductFeaturesContext';
import {
  logCmntyForumsDeleteDialogShownEvent,
  logCmntyForumsDeleteConfirmEvent
} from '../../utils/logging';
import { mintEntrypointImpressionId } from '../../utils/entrypointMetrics';

const DeleteForumEntityModal = ({ translate }: WithTranslationsProps): JSX.Element | null => {
  const { dialogState, closeDeleteDialog } = useModerateDialog();
  const { type, isReply, showPreventSimilar, onConfirmDelete } = dialogState;
  const { features } = useCommunityProductFeatures();
  const [preventSimilarChecked, setPreventSimilarChecked] = useState(true);

  const isDeletePost = type === 'deletePost';
  const isDeleteComment = type === 'deleteComment';
  const isOpen = (isDeletePost || isDeleteComment) && !!onConfirmDelete;

  const commentContentType = isReply ? 'reply' : 'comment';
  const contentType = isDeletePost ? 'post' : commentContentType;
  const preventSimilarShown = !!showPreventSimilar;
  const preventSimilar = preventSimilarShown ? preventSimilarChecked : false;

  const impressionIdRef = useRef('');

  useEffect(() => {
    if (isOpen) {
      setPreventSimilarChecked(true);
      if (features.ForumPreventSimilar) {
        impressionIdRef.current = mintEntrypointImpressionId();
        logCmntyForumsDeleteDialogShownEvent({
          contentType,
          preventSimilarShown,
          deleteDialogImpressionId: impressionIdRef.current
        });
      }
    }
  }, [isOpen, contentType, preventSimilarShown, features.ForumPreventSimilar]);

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!open) {
        closeDeleteDialog();
      }
    },
    [closeDeleteDialog]
  );

  if (!isOpen) {
    return null;
  }

  const deleteCopy = {
    post: {
      title: translate('Label.DeletePost'),
      confirmation: translate('Label.DeletePostConfirmation')
    },
    comment: {
      title: translate('Label.DeleteComment'),
      confirmation: translate('Label.DeleteCommentConfirmation')
    },
    reply: {
      title: translate('Label.DeleteReply'),
      confirmation: translate('Label.DeleteReplyConfirmation')
    }
  };
  const { title: titleText, confirmation: confirmText } = deleteCopy[contentType];

  const handleDelete = async () => {
    if (features.ForumPreventSimilar) {
      logCmntyForumsDeleteConfirmEvent({
        contentType,
        preventSimilarShown,
        preventSimilar,
        deleteDialogImpressionId: impressionIdRef.current
      });
    }
    closeDeleteDialog();
    if (onConfirmDelete) {
      await onConfirmDelete(preventSimilar);
    }
  };

  return (
    <Dialog
      open
      onOpenChange={handleOpenChange}
      isModal
      size='Small'
      type='Default'
      hasCloseAffordance
      closeLabel={translate('Action.Close')}>
      <DialogContent className='delete-forum-entity-dialog'>
        <DialogTitle className='text-heading-small padding-left-large padding-top-medium'>
          {titleText}
        </DialogTitle>
        <DialogBody>
          <p className='text-body-large'>{confirmText}</p>
          {preventSimilarShown && (
            <div className='padding-top-large'>
              <Checkbox
                label={translate('Label.PreventSimilarContent')}
                hint={translate('Description.PreventSimilarContent')}
                size='Medium'
                placement='Start'
                isChecked={preventSimilarChecked}
                onCheckedChange={isChecked => setPreventSimilarChecked(isChecked === true)}
                data-testid='prevent-similar-checkbox'
              />
            </div>
          )}
        </DialogBody>
        <DialogFooter className='flex gap-x-small'>
          <Button variant='Alert' size='Medium' className='fill basis-0' onClick={handleDelete}>
            {translate('Action.Delete')}
          </Button>
          <Button
            variant='Standard'
            size='Medium'
            className='fill basis-0'
            onClick={closeDeleteDialog}>
            {translate('Action.Cancel')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default withTranslations(DeleteForumEntityModal, groupsConfig);
