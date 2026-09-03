import React, { useCallback, useState, useMemo } from 'react';
import { Button } from '@rbx/foundation-ui';
import { Modal, useSystemFeedback } from 'react-style-guide';
import { withTranslations, WithTranslationsProps } from 'react-utilities';
import { groupsConfig } from '../../translation.config';
import forumsService from '../../services/forumsService';
import { ForumCategory } from '../../types';
import { logGroupForumsClickEvent } from '../../../shared/utils/logging';

type Props = {
  groupId: number;
  forumCategory: ForumCategory;
  onSuccess: () => void;
  onClose: () => void;
} & WithTranslationsProps;

const ArchiveForumCategoryDialog = ({
  groupId,
  forumCategory,
  onSuccess,
  onClose,
  translate
}: Props): JSX.Element => {
  const { systemFeedbackService } = useSystemFeedback();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const isArchived = useMemo(() => {
    return forumCategory.archivedBy != null;
  }, [forumCategory.archivedBy]);

  const onArchiveForumCategory = useCallback(async () => {
    try {
      setIsLoading(true);
      await forumsService.archiveGroupForumCategory(groupId, forumCategory.id, !isArchived);
      onSuccess();
      onClose();
      logGroupForumsClickEvent({
        groupId,
        clickTargetType: 'archiveForumCategory',
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
    isArchived
  ]);

  const buttonDisabled = useMemo(() => {
    return isLoading;
  }, [isLoading]);

  return (
    <Modal className='archive-forum-category-dialog' show size='md' backdrop='static'>
      <Modal.Header
        title={translate(
          isArchived ? 'Action.UnarchiveForumCategory' : 'Action.ArchiveForumCategory'
        )}
        onClose={onClose}
      />
      <Modal.Body>
        <div className='group-forums-config-dialog-input'>
          {translate(
            isArchived ? 'Description.UnarchiveForumCategory' : 'Description.ArchiveForumCategory',
            {
              forumCategoryName: forumCategory.name
            }
          )}
        </div>
        <div className='group-forums-config-dialog-button-wrapper'>
          <Button
            isDisabled={buttonDisabled}
            type='button'
            variant='Emphasis'
            size='Medium'
            className='group-forums-config-dialog-button'
            onClick={onArchiveForumCategory}>
            {translate(isArchived ? 'Action.Unarchive' : 'Action.Archive')}
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

export default withTranslations(ArchiveForumCategoryDialog, groupsConfig);
