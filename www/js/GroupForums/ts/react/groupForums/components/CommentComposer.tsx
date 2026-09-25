import React, { useCallback, useMemo } from 'react';
import { withTranslations, WithTranslationsProps } from 'react-utilities';
import { groupsConfig } from '../translation.config';
import { usePost } from '../contexts/PostContext';
import ReplyingToDisplay from './ReplyingToDisplay';
import ContentComposer from './content/ContentComposer';
import useCommentSubmission from '../hooks/useCommentSubmission';
import { useComposer } from '../contexts/ComposerContext';
import useForumStore from '../hooks/useForumStore';
import { MessageContent } from '../../shared/types';
import { useCommunityFeatureFreezes } from '../../shared/contexts/CommunityFeatureFreezesContext';
import {
  createSimpleSlateContent,
  hasRichTextContent
} from '../../shared/utils/messageContentUtils';
import { logGroupForumsClickEvent } from '../../shared/utils/logging';
import useCommentComposerAttachments from '../hooks/useCommentComposerAttachments';

export type CommentComposerProps = {
  showCancelButton?: boolean;
  autoFocus?: boolean;
  disabled?: boolean;
} & WithTranslationsProps;

const CommentComposer = ({
  autoFocus,
  showCancelButton = true,
  disabled = false,
  translate
}: CommentComposerProps): JSX.Element => {
  const { post, getComment } = usePost();
  const groupId = useForumStore.use.groupId();
  const postId = useForumStore.use.postId();

  const { forumsWrite } = useCommunityFeatureFreezes();

  const {
    replyingToCommentId,
    parentCommentId,
    mentioningReplyId,
    editingCommentId,
    resetComposerState,
    commentComposerRef
  } = useComposer();

  const {
    submitComment,
    commentSubmissionError,
    clearCommentSubmissionError
  } = useCommentSubmission({
    editingCommentId,
    parentCommentId,
    mentioningReplyId,
    translate
  });
  const {
    mediaAssetIds,
    isSubmitBlocked: isImageUploadBlockingSubmit,
    leadingControl: attachmentLeadingControl,
    contentFooter: imageUploadPreviews,
    input: imageUploadInput,
    reset: resetImageUploads
  } = useCommentComposerAttachments(!!editingCommentId, disabled || forumsWrite.isDisabled);

  const handleOnClose = useCallback(() => {
    commentComposerRef?.current?.clearText();
    resetComposerState();
    clearCommentSubmissionError();
    resetImageUploads();
  }, [commentComposerRef, resetComposerState, clearCommentSubmissionError, resetImageUploads]);

  const handleOnSubmit = useCallback(
    async (content: MessageContent) => {
      const logEventData = editingCommentId
        ? {
            clickTargetType: 'editComment',
            clickTargetId: editingCommentId
          }
        : {
            clickTargetType: 'createComment',
            clickTargetId: postId
          };

      logGroupForumsClickEvent({
        groupId,
        ...logEventData,
        hasRichText: hasRichTextContent(content)
      });

      const success = await submitComment(content, mediaAssetIds);
      if (success) {
        handleOnClose();
        return true;
      }

      return false;
    },
    [groupId, postId, editingCommentId, submitComment, mediaAssetIds, handleOnClose]
  );

  const handleOnChange = useCallback(() => {
    if (commentSubmissionError) {
      clearCommentSubmissionError();
    }
  }, [commentSubmissionError, clearCommentSubmissionError]);

  const replyMentionName = useMemo(() => {
    if (mentioningReplyId) {
      const reply = getComment(mentioningReplyId, parentCommentId);
      if (reply) {
        return reply.creatorInfo.displayName;
      }
    }
    return '';
  }, [parentCommentId, mentioningReplyId, getComment]);

  const defaultContent = useMemo(() => {
    if (editingCommentId) {
      const comment = getComment(editingCommentId, parentCommentId);
      return comment?.content;
    }
    if (replyMentionName) {
      return createSimpleSlateContent(`@${replyMentionName} `);
    }
    return undefined;
  }, [editingCommentId, parentCommentId, replyMentionName, getComment]);

  const replyingToUserId = useMemo(() => {
    if (replyingToCommentId && replyingToCommentId !== post?.firstComment.id) {
      const comment = getComment(replyingToCommentId);
      if (comment) {
        return comment.createdBy;
      }
    }
    return undefined;
  }, [post, replyingToCommentId, getComment]);

  const renderLabel = useCallback(() => {
    if (editingCommentId) {
      return translate(parentCommentId ? 'Label.EditReply' : 'Label.EditComment');
    }
    if (replyingToUserId) {
      return <ReplyingToDisplay userId={replyingToUserId} />;
    }
    return null;
  }, [parentCommentId, editingCommentId, replyingToUserId, translate]);

  return (
    <React.Fragment>
      <ContentComposer
        autoFocus={autoFocus}
        defaultContent={defaultContent}
        errorMessage={commentSubmissionError}
        label={renderLabel()}
        contentLeadingControl={attachmentLeadingControl}
        contentFooter={imageUploadPreviews}
        disabled={disabled || forumsWrite.isDisabled}
        submitDisabled={!!commentSubmissionError || isImageUploadBlockingSubmit}
        onChange={handleOnChange}
        onSubmit={handleOnSubmit}
        onCancel={showCancelButton ? handleOnClose : undefined}
        onClose={handleOnClose}
        inputRef={commentComposerRef}
        isCollapsedInitially={false}
      />
      {imageUploadInput}
    </React.Fragment>
  );
};

export default withTranslations(CommentComposer, groupsConfig);
