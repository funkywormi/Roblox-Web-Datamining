import { MessageContent } from '../../shared/types';
import validation from '../../shared/utils/validation';
import groupAnnouncementsConstants from '../constants/groupAnnouncementsConstants';

export const GetAnnouncementTitleValidationErrorKey = (
  title: MessageContent
): string | undefined => {
  return validation.validateStringLength(
    title.plainText || '',
    'Error.AnnouncementTitleValidationMinLength',
    groupAnnouncementsConstants.validation.titleMinLength
  );
};

export const GetAnnouncementContentValidationErrorKey = (
  content: MessageContent
): string | undefined => {
  if (content.slate) {
    return validation.validateRichTextLength(
      content.slate,
      'Error.AnnouncementContentValidationMinLength',
      'Error.AnnouncementContentValidationMaxLength',
      groupAnnouncementsConstants.validation.contentMinLength,
      groupAnnouncementsConstants.validation.contentMaxLength
    );
  }

  return validation.validateStringLength(
    content.plainText || '',
    'Error.AnnouncementContentValidationMinLength',
    groupAnnouncementsConstants.validation.contentMinLength
  );
};
