// Request layer for passkey registration during signup.
import { httpService } from 'core-utilities';
import { TStartPreauthRegistrationResponse } from '../../common/types/signupTypes';
import { urlConstants } from '../constants/signupConstants';

const AUTH_API_TIMEOUT = 10000;

/**
 * Begins the pre-authenticated passkey registration ceremony. Unlike
 * 'StartRegistration' this endpoint doesn't require an authenticated
 * session.
 *
 * The returned `sessionId` should be handed to backend which handles
 * passkey binding.
 */
export const startPreauthRegistration = async (
  username: string
): Promise<TStartPreauthRegistrationResponse> => {
  const urlConfig = {
    timeout: AUTH_API_TIMEOUT,
    withCredentials: true,
    url: urlConstants.startPreauthRegistration
  };
  const { data } = await httpService.post<TStartPreauthRegistrationResponse>(urlConfig, {
    username
  });
  return data;
};

export default {
  startPreauthRegistration
};
