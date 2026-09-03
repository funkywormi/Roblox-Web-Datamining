import React, { createContext, useContext, useState, useCallback } from 'react';
import type { ModerateDialogContextValue, ModerateDialogState } from '../types';

const ModerateDialogContext = createContext<ModerateDialogContextValue | undefined>(undefined);

export const useModerateDialog = (): ModerateDialogContextValue => {
  const context = useContext(ModerateDialogContext);
  if (!context) {
    throw new Error('useModerateDialog must be used within a ModerateDialogProvider');
  }
  return context;
};

export interface ModerateDialogProviderProps {
  children: React.ReactNode;
}

export const ModerateDialogProvider: React.FC<ModerateDialogProviderProps> = ({ children }) => {
  const [dialogState, setDialogState] = useState<ModerateDialogState>({});

  const closeDialog = useCallback(() => {
    setDialogState({});
  }, []);

  const openBanDialog = useCallback(
    ({
      groupId,
      userId,
      onDeletePosts,
      onModerationSuccess
    }: {
      groupId: number;
      userId: number;
      onDeletePosts?: () => Promise<void> | void;
      onModerationSuccess?: () => Promise<void> | void;
    }) => {
      setDialogState({
        groupId,
        userId,
        type: 'ban',
        onDeletePosts,
        onModerationSuccess
      });
    },
    []
  );

  const openKickDialog = useCallback(
    ({
      groupId,
      userId,
      onDeletePosts,
      onModerationSuccess
    }: {
      groupId: number;
      userId: number;
      onDeletePosts?: () => Promise<void> | void;
      onModerationSuccess?: () => Promise<void> | void;
    }) => {
      setDialogState({
        groupId,
        userId,
        type: 'kick',
        onDeletePosts,
        onModerationSuccess
      });
    },
    []
  );

  const openBlockDialog = useCallback((userId: number) => {
    setDialogState({
      userId,
      type: 'block'
    });
  }, []);

  const openHidePostDialog = useCallback(
    ({
      groupId,
      categoryId,
      postId,
      threadId,
      commentId,
      onHideSuccess
    }: {
      groupId: number;
      categoryId: string;
      postId: string;
      threadId: string;
      commentId: string;
      onHideSuccess?: () => Promise<void> | void;
    }) => {
      setDialogState({
        groupId,
        categoryId,
        postId,
        threadId,
        commentId,
        type: 'hidePost',
        onHideSuccess
      });
    },
    []
  );

  const openHideCommentDialog = useCallback(
    ({
      groupId,
      categoryId,
      postId,
      threadId,
      commentId,
      onHideSuccess
    }: {
      groupId: number;
      categoryId: string;
      postId: string;
      threadId: string;
      commentId: string;
      onHideSuccess?: () => Promise<void> | void;
    }) => {
      setDialogState({
        groupId,
        categoryId,
        postId,
        threadId,
        commentId,
        type: 'hideComment',
        onHideSuccess
      });
    },
    []
  );

  const openDeletePostDialog = useCallback(
    ({
      showPreventSimilar,
      onConfirmDelete
    }: {
      showPreventSimilar: boolean;
      onConfirmDelete: (preventSimilar: boolean) => Promise<void> | void;
    }) => {
      setDialogState({
        type: 'deletePost',
        showPreventSimilar,
        onConfirmDelete
      });
    },
    []
  );

  const openDeleteCommentDialog = useCallback(
    ({
      isReply,
      showPreventSimilar,
      onConfirmDelete
    }: {
      isReply: boolean;
      showPreventSimilar: boolean;
      onConfirmDelete: (preventSimilar: boolean) => Promise<void> | void;
    }) => {
      setDialogState({
        type: 'deleteComment',
        isReply,
        showPreventSimilar,
        onConfirmDelete
      });
    },
    []
  );

  const value: ModerateDialogContextValue = {
    dialogState,
    openBanDialog,
    openKickDialog,
    openBlockDialog,
    openHidePostDialog,
    openHideCommentDialog,
    openDeletePostDialog,
    openDeleteCommentDialog,
    closeBanDialog: closeDialog,
    closeKickDialog: closeDialog,
    closeBlockDialog: closeDialog,
    closeHideDialog: closeDialog,
    closeDeleteDialog: closeDialog
  };

  return <ModerateDialogContext.Provider value={value}>{children}</ModerateDialogContext.Provider>;
};
