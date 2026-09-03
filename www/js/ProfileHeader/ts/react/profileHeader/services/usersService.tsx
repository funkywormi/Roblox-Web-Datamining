import { httpService } from 'core-utilities';
import apiConstants from '../constants/apiEndpoint';
import { TGetProfileUserResponse } from '../types/profileHeaderTypes';

const getProfileUser = async (profileId: number): Promise<TGetProfileUserResponse> => {
  const {
    data
  }: {
    data: TGetProfileUserResponse;
  } = await httpService.get(apiConstants.getUser(profileId));
  return data;
};

export default {
  getProfileUser
};
