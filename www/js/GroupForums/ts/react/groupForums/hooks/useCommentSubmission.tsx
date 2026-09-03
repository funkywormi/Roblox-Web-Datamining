import { useCallback, useState } from 'react';
import { useSystemFeedback } from 'react-style-guide';
import { TranslateFunction } from 'react-utilities';
import { httpResponseCodes } from 'core-utilities';
import { usePost } from '../contexts/PostContext';
import { ForumsErrorResponse } from '../types';
import groupForumsConstants from '../constants/groupForumsConstants';
import useForumStore from './useForumStore';
import { MessageContent } from '../../shared/types';

type UseCommentSubmissionProps = {
  editingCommentId?: string;
  parentCommentId?: string;
  mentioningReplyId?: string;
  translate: TranslateFunction;
};

type UseCommentSubmissionReturn = {
  submitComment: (content: MessageContent) => Promise<boolean>;
  commentSubmissionError: string;
  clearCommentSubmissionError: () => void;
};

const useCommentSubmission = ({
  editingCommentId,
  parentCommentId,
  mentioningReplyId,
  translate
}: UseCommentSubmissionProps): UseCommentSubmissionReturn => {
  const { handleCreateComment, handleEditComment } = usePost();
  const { systemFeedbackService } = useSystemFeedback();
  const [commentSubmissionError, setCommentSubmissionError] = useState('');
  const setCommentRateLimitExpiresAt = useForumStore.use.setCommentRateLimitExpiresAt();

  const handleCommentSubmissionError = useCallback(
    (error: unknown) => {
      const typedError = error as ForumsErrorResponse;

      // Check for rate limiting error (429)
      if (typedError.status === httpResponseCodes.tooManyAttempts && typedError.retryAfterSeconds) {
        setCommentRateLimitExpiresAt(Date.now() + typedError.retryAfterSeconds * 1000);
        return;
      }

      if (typedError.status === httpResponseCodes.badRequest) {
        const firstErrorData = typedError.data?.errors?.[0];
        if (firstErrorData?.code === groupForumsConstants.errorCodes.contentModerated) {
          setCommentSubmissionError(translate('Error.CommentModerationFailed'));
          return;
        }
      }
      systemFeedbackService.warning(translate('NetworkError'));
    },
    [translate, systemFeedbackService, setCommentRateLimitExpiresAt]
  );

  const clearCommentSubmissionError = useCallback(() => {
    setCommentSubmissionError('');
  }, []);

  const submitComment = useCallback(
    async (content: MessageContent) => {
      try {
        if (editingCommentId) {
          await handleEditComment({
            content,
            commentId: editingCommentId,
            parentCommentId
          });
        } else {
          await handleCreateComment({ content, parentCommentId, mentioningReplyId });
        }
        return true;
      } catch (error) {
        handleCommentSubmissionError(error);
        return false;
      }
    },
    [
      editingCommentId,
      parentCommentId,
      mentioningReplyId,
      handleCreateComment,
      handleEditComment,
      handleCommentSubmissionError
    ]
  );

  return {
    submitComment,
    commentSubmissionError,
    clearCommentSubmissionError
  };
};

export default useCommentSubmission;
