import groupForumsConstants from '../constants/groupForumsConstants';
import { ForumsErrorResponse } from '../types';

export const MODERATION_ERROR_KEY = 'Error.ForumPostModerated';
export const NETWORK_ERROR_KEY = 'NetworkError';
const AGE_INELIGIBLE_ERROR_KEY = 'Message.AgeIneligible';
const SUPPORT_TICKET_DETAILS_TOO_LONG_ERROR_KEY = 'Message.SupportTicketDetailsTooLong';
const SUPPORT_TICKET_OPEN_LIMIT_REACHED_ERROR_KEY = 'Error.SupportTicketOpenLimitReached';
const SUPPORT_TICKET_INELIGIBLE_ERROR_KEY = 'Error.SupportTicketIneligible';
const { errorCodes } = groupForumsConstants;

const ERROR_KEYS_BY_CODE: Readonly<Record<number, string>> = {
  [errorCodes.contentModerated]: MODERATION_ERROR_KEY,
  [errorCodes.supportTicketDetailsTooLong]: SUPPORT_TICKET_DETAILS_TOO_LONG_ERROR_KEY,
  [errorCodes.supportTicketAgeIneligible]: AGE_INELIGIBLE_ERROR_KEY,
  [errorCodes.supportTicketOpenLimitReached]: SUPPORT_TICKET_OPEN_LIMIT_REACHED_ERROR_KEY,
  [errorCodes.supportTicketIneligible]: SUPPORT_TICKET_INELIGIBLE_ERROR_KEY
};

export const getPostErrorKey = (error: unknown): string => {
  const typedError = error as ForumsErrorResponse;
  const firstErrorCode = typedError.data?.errors?.[0]?.code;
  return firstErrorCode === undefined
    ? NETWORK_ERROR_KEY
    : ERROR_KEYS_BY_CODE[firstErrorCode] ?? NETWORK_ERROR_KEY;
};
