import groupForumsConstants from '../constants/groupForumsConstants';
import validation from '../../shared/utils/validation';
import { MessageContent } from '../../shared/types';

export const GetForumCategoryNameValidationErrorKey = (name: string): string | null => {
  if (name.length < groupForumsConstants.limits.categoryNameMinLength) {
    return 'Error.ForumCategoryNameValidationTooShort';
  }

  return null;
};

export const GetForumCategoryDescriptionValidationErrorKey = (
  description: string
): string | null => {
  if (description.length < groupForumsConstants.limits.categoryDescriptionMinLength) {
    return 'Error.ForumCategoryDescriptionValidationTooShort';
  }
  return null;
};

export const GetDeleteForumCategoryNameValidationErrorKey = (
  name: string,
  typedName: string
): string | null => {
  if (name !== typedName) {
    return 'Error.DeleteForumCategoryNameValidationNotEqual';
  }
  return null;
};

export const GetForumCategoryErrorMessageErrorKey = (errorMessage: string): string | null => {
  if (errorMessage.includes('InappropriateContent')) {
    return 'Error.CategoryNameInappropriateContent';
  }
  return null;
};

export const GetForumPostTitleValidationErrorKey = (title: MessageContent): string | undefined => {
  return validation.validateStringLength(
    title.plainText,
    'Error.ForumTitleValidationMinLength',
    groupForumsConstants.limits.postTitleMinLength
  );
};

export const GetForumPostContentValidationErrorKey = (
  content: MessageContent
): string | undefined => {
  if (content.slate) {
    return validation.validateRichTextLength(
      content.slate,
      'Error.ForumContentValidationMinLength',
      'Error.ForumContentValidationMaxLength',
      groupForumsConstants.limits.postContentMinLength,
      groupForumsConstants.limits.postContentMaxLength,
      false
    );
  }
  return validation.validateStringLength(
    content.plainText,
    'Error.ForumContentValidationMinLength',
    groupForumsConstants.limits.postContentMinLength,
    Infinity,
    false
  );
};

export const GetForumCommentContentValidationErrorKey = (
  content: MessageContent,
  ignoreEmpty = true
): string | undefined => {
  if (content.slate) {
    return validation.validateRichTextLength(
      content.slate,
      'Error.ForumContentValidationMinLength',
      'Error.ForumContentValidationMaxLength',
      groupForumsConstants.limits.postContentMinLength,
      groupForumsConstants.limits.postContentMaxLength,
      ignoreEmpty
    );
  }

  return validation.validateStringLength(
    content.plainText,
    'Error.ForumContentValidationMinLength',
    groupForumsConstants.limits.commentContentMinLength,
    Infinity,
    ignoreEmpty
  );
};
