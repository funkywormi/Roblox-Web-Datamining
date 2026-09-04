import { EnvironmentUrls } from 'Roblox';
import { httpService } from 'core-utilities';
import { passkeyUrl } from '../constants/urlConstants';
import { StartAuthenticationResponse } from '../types/passkeyTypes';

const getAuthAPIUrl = (endpoint: string): string => EnvironmentUrls.authApi + endpoint;

export const getPasskeyChallenge = async (): Promise<StartAuthenticationResponse> => {
  const url = getAuthAPIUrl(passkeyUrl.startAuthentication);
  const urlConfig = {
    url
  };
  const { data } = await httpService.post<StartAuthenticationResponse>(urlConfig);
  return data;
};

/**
 * Check if passkey is enabled in passkey metadata from meta tag
 *
 * @returns {boolean}
 */
export const isPasskeyLoginEnabled = (): boolean => {
  const metaTag = document.querySelector<HTMLElement>('meta[name="passkey-data"]');
  const keyMap = metaTag?.dataset || {};
  return keyMap.isPasskeyLoginEnabled === 'true';
};

export default {
  getPasskeyChallenge,
  isPasskeyLoginEnabled
};
