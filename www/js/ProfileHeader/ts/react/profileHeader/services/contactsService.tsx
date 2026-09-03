import { httpService } from 'core-utilities';
import apiConstants from '../constants/apiEndpoint';
import { TGetUserTagResponse, TSetUserTagResponse } from '../types/profileHeaderTypes';

const getUserTag = async (profileId: number): Promise<TGetUserTagResponse> => {
  const {
    data
  }: {
    data: TGetUserTagResponse;
  } = await httpService.post(apiConstants.getUserTag(), {
    targetUserIds: [profileId]
  });
  return data;
};

const setUserTag = async (targetUserId: number, userTag: string): Promise<TSetUserTagResponse> => {
  const {
    data
  }: {
    data: TSetUserTagResponse;
  } = await httpService.post(apiConstants.setUserTag(), {
    targetUserId,
    userTag
  });
  return data;
};

export default {
  getUserTag,
  setUserTag
};
