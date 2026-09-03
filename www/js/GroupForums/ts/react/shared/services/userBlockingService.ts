import { httpService } from 'core-utilities';
import moderationConstants from '../constants/moderationConstants';

const blockUser = async (profileId: number): Promise<{}> => {
  const urlConfig = {
    url: moderationConstants.urls.blockUser(profileId),
    withCredentials: true
  };

  const { data }: { data: {} } = await httpService.post(urlConfig);
  return data;
};

export default {
  blockUser
};
