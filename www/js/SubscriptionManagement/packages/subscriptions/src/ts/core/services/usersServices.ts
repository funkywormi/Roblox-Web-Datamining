import { httpService } from 'core-utilities';
import type { AxiosResponse } from '@rbx/core-scripts/http';
import serviceConstants from '../constants/serviceConstants';
import { GetUserBirthdateResponse } from '../types/serviceTypes';

export const getUserBirthdate = async (): Promise<AxiosResponse<GetUserBirthdateResponse>> => {
  return httpService.get(serviceConstants.url.getUserBirthdateUrlConfig());
};

export default { getUserBirthdate };
