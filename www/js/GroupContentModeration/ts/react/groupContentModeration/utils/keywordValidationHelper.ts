import groupContentModerationConstants from '../constants/groupContentModerationConstants';

const validateKeyword = (keyword: string, isEditing: boolean): string | undefined => {
  const trimmedKeyword = keyword.trim();

  if (!trimmedKeyword) {
    return isEditing
      ? groupContentModerationConstants.translations.ValidationEditKeywordEmpty
      : groupContentModerationConstants.translations.ValidationCreateKeywordEmpty;
  }

  // Validate that the keyword does not consist only of one or more wildcard characters.
  // This will invalidate "*", "**", "***", etc.
  if (/^\*+$/.test(trimmedKeyword)) {
    return groupContentModerationConstants.translations.ValidationKeywordCannotBeOnlyWildcard;
  }

  // Regex replaces leading and trailing wildcards to check the actual content.
  const keywordWithoutWildcards = trimmedKeyword.replace(/^\*+|\*+$/g, '').trim();
  if (
    keywordWithoutWildcards.length < groupContentModerationConstants.limits.minBlockedKeywordLength
  ) {
    return groupContentModerationConstants.translations.ValidationKeywordTooShort;
  }

  if (trimmedKeyword.length > groupContentModerationConstants.limits.maxBlockedKeywordLength) {
    return groupContentModerationConstants.translations.ValidationKeywordTooLong;
  }

  return undefined; // No validation error
};

export default validateKeyword;
