import { ProfilePlatformRequestBody, ProfilePlatformResponse } from '../types';
import { fetchProfilePlatformApiUrl } from '../constants/networkingConstants';

const fetchProfilePlatform = async (requestBody: ProfilePlatformRequestBody): Promise<ProfilePlatformResponse> => {
  const { httpService } = (window as any).CoreUtilities;
  const urlConfig = {
    url: fetchProfilePlatformApiUrl,
    retryable: true,
    withCredentials: true
  };

  const response = await httpService.post(urlConfig, requestBody);
  return response.data;
};

export { fetchProfilePlatform };
