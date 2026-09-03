import { ForumAncestry } from '../types';

const hasCorrectCategory = (categoryId: string, ancestor: ForumAncestry): boolean =>
  ancestor.channelId === categoryId && ancestor.channel.id === categoryId;

const hasCorrectPostChannel = (
  categoryId: string,
  postId: string,
  ancestor: ForumAncestry
): boolean =>
  ancestor.channelId === postId &&
  ancestor.channel.id === postId &&
  ancestor.channel.parentChannelId === categoryId;

const hasCorrectThreadChannel = (threadId: string, ancestor: ForumAncestry): boolean =>
  ancestor.channelId === threadId && ancestor.channel.id === threadId;

const hasCorrectComment = (postId: string, commentId: string, ancestor: ForumAncestry): boolean =>
  ancestor.commentId === commentId &&
  ancestor.comment?.id === commentId &&
  ancestor.comment?.parentId === postId;

export const isTopLevelComment = (
  categoryId: string,
  postId: string,
  commentId: string,
  ancestors: ForumAncestry[]
): boolean =>
  ancestors.length === 2 &&
  hasCorrectCategory(categoryId, ancestors[0]) &&
  hasCorrectPostChannel(categoryId, postId, ancestors[1]) &&
  hasCorrectComment(postId, commentId, ancestors[1]);

export const isThreadedComment = (
  categoryId: string,
  threadId: string,
  commentId: string,
  ancestors: ForumAncestry[]
): boolean =>
  ancestors.length === 3 &&
  hasCorrectCategory(categoryId, ancestors[0]) &&
  hasCorrectThreadChannel(threadId, ancestors[2]) &&
  hasCorrectComment(threadId, commentId, ancestors[2]);

export const getThreadPostAndComment = (
  ancestors: ForumAncestry[]
): { postId?: string; commentId?: string } =>
  ancestors.length !== 3
    ? {}
    : {
        postId: ancestors[1].channelId,
        commentId: ancestors[1].comment?.id
      };
