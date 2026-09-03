import React, { createContext, useCallback, useContext, useMemo, useState, useRef } from 'react';
import { EditableContentFieldHandle } from '../../shared/components/content/EditableContentFieldInput';

interface ComposerState {
  replyingToCommentId?: string;
  mentioningReplyId?: string;
  highlightedCommentId?: string;
  parentCommentId?: string;
  editingCommentId?: string;
  editingCommentParentId?: string;
  setReplyToCommentOrPost: (commentId: string) => void;
  setReplyToCommentReply: (parentCommentId: string, commentId: string) => void;
  setEditComment: (commentId: string, parentCommentId?: string) => void;
  resetComposerState: () => void;
  commentComposerRef: React.RefObject<EditableContentFieldHandle>;
}

export const ComposerContext = createContext<ComposerState | undefined>(undefined);

export const useComposer = (): ComposerState => {
  const resource = useContext(ComposerContext);
  if (!resource) {
    throw new Error('useComposer must be used within a ComposerProvider');
  }
  return resource;
};

export type ComposerProviderProps = {
  children: React.ReactNode;
};

export function ComposerProvider({ children }: ComposerProviderProps): JSX.Element {
  const [mentioningReplyId, setMentioningReplyId] = useState<string>();
  const [replyingToCommentId, setReplyingToCommentId] = useState<string>();
  const [editingCommentId, setEditingCommentId] = useState<string>();
  const [editingCommentParentId, setEditingCommentParentId] = useState<string>();

  const commentComposerRef = useRef<EditableContentFieldHandle>(null);

  const scrollToCommentComposer = useCallback(() => {
    commentComposerRef.current?.focus();
  }, [commentComposerRef]);

  const resetComposerState = useCallback(() => {
    setReplyingToCommentId(undefined);
    setMentioningReplyId(undefined);
    setEditingCommentId(undefined);
  }, []);

  const setReplyToCommentOrPost = useCallback(
    (commentId: string) => {
      if (replyingToCommentId === commentId && !mentioningReplyId) {
        return;
      }
      resetComposerState();
      setReplyingToCommentId(commentId);
      scrollToCommentComposer();
    },
    [replyingToCommentId, mentioningReplyId, resetComposerState, scrollToCommentComposer]
  );

  const setReplyToCommentReply = useCallback(
    (parentCommentId: string, commentId: string) => {
      if (mentioningReplyId === commentId) {
        return;
      }
      resetComposerState();
      setReplyingToCommentId(parentCommentId);
      setMentioningReplyId(commentId);
      scrollToCommentComposer();
    },
    [mentioningReplyId, resetComposerState, scrollToCommentComposer]
  );

  const setEditComment = useCallback(
    (commentId: string, parentCommentId?: string) => {
      if (editingCommentId === commentId) {
        return;
      }
      resetComposerState();
      setEditingCommentId(commentId);
      setEditingCommentParentId(parentCommentId);
      scrollToCommentComposer();
    },
    [editingCommentId, resetComposerState, scrollToCommentComposer]
  );

  const parentCommentId = useMemo(() => {
    if (editingCommentId) {
      return editingCommentParentId;
    }
    return replyingToCommentId;
  }, [editingCommentId, replyingToCommentId, editingCommentParentId]);

  const highlightedCommentId = useMemo(() => {
    if (editingCommentId) {
      return editingCommentId;
    }
    if (mentioningReplyId) {
      return mentioningReplyId;
    }
    return replyingToCommentId;
  }, [editingCommentId, mentioningReplyId, replyingToCommentId]);

  return (
    <ComposerContext.Provider
      value={{
        replyingToCommentId,
        mentioningReplyId,
        highlightedCommentId,
        parentCommentId,
        editingCommentId,
        editingCommentParentId,
        setReplyToCommentOrPost,
        setReplyToCommentReply,
        setEditComment,
        resetComposerState,
        commentComposerRef
      }}>
      {children}
    </ComposerContext.Provider>
  );
}
