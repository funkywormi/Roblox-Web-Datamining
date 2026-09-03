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

const DesktopPersistentComposer = ({ translate }: WithTranslationsProps): JSX.Element => {
  const groupId = useForumStore.use.groupId();
  const postId = useForumStore.use.postId();
  const inputRef = useRef<EditableContentFieldHandle>(null);
  const editorRef = useRef<RichTextEditorHandle>(null);

  const {
    submitComment,
    commentSubmissionError,
    clearCommentSubmissionError
  } = useCommentSubmission({ translate });

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

      const success = await submitComment(content);
      if (success) {
        inputRef.current?.clearText();
        editorRef.current?.clear();
        return true;
      }
      return false;
    },
    [groupId, postId, submitComment]
  );

  const handleOnChange = useCallback(() => {
    if (commentSubmissionError) {
      clearCommentSubmissionError();
    }
  }, [commentSubmissionError, clearCommentSubmissionError]);

  const { disabled, disabledTooltip, showTierGate } = useReplyDisabledState({ translate });

  if (showTierGate) {
    return (
      <div className='desktop-persistent-composer-container'>
        <ForumTierGateMessage testId='forum-composer-tier-gate' />
      </div>
    );
  }

  return (
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
          disabled={disabled}
          submitDisabled={!!commentSubmissionError}
          onChange={handleOnChange}
          onSubmit={handleOnSubmit}
          inputRef={inputRef}
          editorRef={editorRef}
        />
      </div>
    </ConditionalTooltip>
  );
};

export default withTranslations(DesktopPersistentComposer, groupsConfig);
