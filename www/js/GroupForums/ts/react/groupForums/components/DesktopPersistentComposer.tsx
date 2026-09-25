import React, { useCallback, useRef } from 'react';
import { withTranslations, WithTranslationsProps } from 'react-utilities';
import classNames from 'classnames';
import { RichTextEditorHandle } from '@rbx/richtext-editor';
import { groupsConfig } from '../translation.config';
import ContentComposer from './content/ContentComposer';
import { EditableContentFieldHandle } from '../../shared/components/content/EditableContentFieldInput';
import useReplyDisabledState from '../hooks/useReplyDisabledState';
import ConditionalTooltip from '../../shared/components/ConditionalTooltip';
import useForumStore from '../hooks/useForumStore';
import useCommentSubmission from '../hooks/useCommentSubmission';
import { MessageContent } from '../../shared/types';
import { logGroupForumsClickEvent } from '../../shared/utils/logging';
import { hasRichTextContent } from '../../shared/utils/messageContentUtils';
import ForumTierGateMessage from './ForumTierGateMessage';
import useCommentComposerAttachments from '../hooks/useCommentComposerAttachments';

const DesktopPersistentComposer = ({ translate }: WithTranslationsProps): JSX.Element => {
  const groupId = useForumStore.use.groupId();
  const postId = useForumStore.use.postId();
  const inputRef = useRef<EditableContentFieldHandle>(null);
  const editorRef = useRef<RichTextEditorHandle>(null);
  const { disabled, disabledTooltip, showTierGate } = useReplyDisabledState({ translate });

  const {
    submitComment,
    commentSubmissionError,
    clearCommentSubmissionError
  } = useCommentSubmission({ translate });
  const {
    mediaAssetIds,
    isSubmitBlocked: isImageUploadBlockingSubmit,
    leadingControl: attachmentLeadingControl,
    contentFooter: imageUploadPreviews,
    input: imageUploadInput,
    reset: resetImageUploads
  } = useCommentComposerAttachments(false, disabled);

  const handleOnSubmit = useCallback(
    async (content: MessageContent) => {
      const logEventData = {
        clickTargetType: 'createComment',
        clickTargetId: postId,
        hasRichText: hasRichTextContent(content)
      };
      logGroupForumsClickEvent({
        groupId,
        ...logEventData
      });

      const success = await submitComment(content, mediaAssetIds);
      if (success) {
        inputRef.current?.clearText();
        editorRef.current?.clear();
        resetImageUploads();
        return true;
      }
      return false;
    },
    [groupId, postId, submitComment, mediaAssetIds, resetImageUploads]
  );

  const handleOnChange = useCallback(() => {
    if (commentSubmissionError) {
      clearCommentSubmissionError();
    }
  }, [commentSubmissionError, clearCommentSubmissionError]);

  if (showTierGate) {
    return (
      <div className='desktop-persistent-composer-container'>
        <ForumTierGateMessage testId='forum-composer-tier-gate' />
      </div>
    );
  }

  return (
    <React.Fragment>
      <ConditionalTooltip
        containerClassName='desktop-persistent-composer-container'
        id='desktop-persistent-composer-tooltip'
        position='top-center'
        content={disabledTooltip}
        enabled={disabled}>
        <div className={classNames('desktop-persistent-composer', disabled && 'disabled')}>
          <ContentComposer
            autoFocus={false}
            errorMessage={commentSubmissionError}
            contentLeadingControl={attachmentLeadingControl}
            contentFooter={imageUploadPreviews}
            disabled={disabled}
            submitDisabled={!!commentSubmissionError || isImageUploadBlockingSubmit}
            onChange={handleOnChange}
            onSubmit={handleOnSubmit}
            inputRef={inputRef}
            editorRef={editorRef}
          />
        </div>
      </ConditionalTooltip>
      {imageUploadInput}
    </React.Fragment>
  );
};

export default withTranslations(DesktopPersistentComposer, groupsConfig);
