import { BatchProfilePlatformRequestBody, BatchProfilePlatformResponse } from '../types';
import { fetchBatchProfilePlatformApiUrl } from '../constants/networkingConstants';

const fetchBatchProfilePlatform = async (
  requestBody: BatchProfilePlatformRequestBody
): Promise<BatchProfilePlatformResponse> => {
  const { httpService } = (window as any).CoreUtilities;
  const urlConfig = {
    url: fetchBatchProfilePlatformApiUrl,
    retryable: true,
    withCredentials: true
  };

  const response = await httpService.post(urlConfig, requestBody);
  return response.data;
};

export { fetchBatchProfilePlatform };
