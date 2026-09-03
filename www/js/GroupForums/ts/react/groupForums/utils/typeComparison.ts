import { ForumComment, ForumPost } from '../types';

export const ComparePost = (postA: ForumPost, postB: ForumPost): boolean => {
  return postA.id === postB.id;
};

export const CompareComments = (commentA: ForumComment, commentB: ForumComment): boolean => {
  return commentA.id === commentB.id;
};
