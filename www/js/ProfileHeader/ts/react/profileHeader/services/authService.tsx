import { httpService } from 'core-utilities';
import apiConstants from '../constants/apiEndpoint';

const impersonateUser = async (profileId: number): Promise<{}> => {
  const { data }: { data: {} } = await httpService.post(apiConstants.impersonateUser(profileId));
  return data;
};

export default {
  impersonateUser
};
