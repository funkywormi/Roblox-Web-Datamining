import groupContentModerationConstants from '../constants/groupContentModerationConstants';
import { QueryError } from '../types';

const getErrorCode = (queryError: QueryError): number | undefined => {
  return queryError.data?.errors?.length ? queryError.data.errors[0].code : undefined;
};

export const hasKeywordModeratedError = (queryError: QueryError): boolean => {
  const errorCode = getErrorCode(queryError);
  return (
    errorCode !== undefined &&
    queryError.status === 400 &&
    errorCode === groupContentModerationConstants.errorCodes.blockedKeywordModerated
  );
};

export const hasInvalidRequestError = (queryError: QueryError): boolean => {
  const errorCode = getErrorCode(queryError);
  return (
    errorCode !== undefined &&
    queryError.status === 400 &&
    errorCode === groupContentModerationConstants.errorCodes.invalidRequest
  );
};

export const hasConflictError = (queryError: QueryError): boolean => {
  const errorCode = getErrorCode(queryError);
  return (
    errorCode !== undefined &&
    queryError.status === 409 &&
    errorCode === groupContentModerationConstants.errorCodes.conflict
  );
};

export const isNonValidationError = (queryError: QueryError): boolean => {
  return (
    !hasKeywordModeratedError(queryError) &&
    !hasInvalidRequestError(queryError) &&
    !hasConflictError(queryError)
  );
};
