import React, { useCallback, useState, useMemo } from 'react';
import { Button } from '@rbx/foundation-ui';
import { Modal, useSystemFeedback } from 'react-style-guide';
import { withTranslations, WithTranslationsProps } from 'react-utilities';
import { groupsConfig } from '../../translation.config';
import forumsService from '../../services/forumsService';
import { ForumCategory } from '../../types';
import groupForumsConstants from '../../constants/groupForumsConstants';
import { GetDeleteForumCategoryNameValidationErrorKey } from '../../utils/groupForumsValidation';
import { logGroupForumsClickEvent } from '../../../shared/utils/logging';

type Props = {
  groupId: number;
  forumCategory: ForumCategory;
  onSuccess: () => void;
  onClose: () => void;
} & WithTranslationsProps;

const DeleteForumCategoryDialog = ({
  groupId,
  forumCategory,
  onSuccess,
  onClose,
  translate
}: Props): JSX.Element => {
  const { systemFeedbackService } = useSystemFeedback();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const archived = useMemo(() => {
    return forumCategory.archivedBy != null;
  }, [forumCategory]);

  const onDeleteForumCategory = useCallback(async () => {
    try {
      setIsLoading(true);
      await forumsService.deleteGroupForumCategory(groupId, forumCategory.id, archived);
      onSuccess();
      onClose();
      logGroupForumsClickEvent({
        groupId,
        clickTargetType: 'deleteForumCategory',
        clickTargetId: forumCategory.id
      });
    } catch {
      systemFeedbackService.warning(translate('NetworkError'));
    } finally {
      setIsLoading(false);
    }
  }, [
    onSuccess,
    onClose,
    groupId,
    forumCategory.id,
    translate,
    systemFeedbackService,
    setIsLoading,
    archived
  ]);

  const deleteDisabled = useMemo(() => {
    return isLoading;
  }, [isLoading]);

  return (
    <Modal className='delete-forum-category-dialog' show size='md' backdrop='static'>
      <Modal.Header title={translate('Action.DeleteForumCategory')} onClose={onClose} />
      <Modal.Body>
        <div className='group-forums-config-dialog-input'>
          {translate('Description.DeleteForumCategory', {
            forumCategoryName: forumCategory.name
          })}
        </div>
        <div className='group-forums-config-dialog-button-wrapper'>
          <Button
            isDisabled={deleteDisabled}
            type='button'
            variant='Alert'
            size='Medium'
            className='group-forums-config-dialog-button'
            onClick={onDeleteForumCategory}>
            {translate('Action.Delete')}
          </Button>
          <Button
            type='button'
            variant='Standard'
            size='Medium'
            className='group-forums-config-dialog-button'
            onClick={onClose}>
            {translate('Action.Cancel')}
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default withTranslations(DeleteForumCategoryDialog, groupsConfig);
