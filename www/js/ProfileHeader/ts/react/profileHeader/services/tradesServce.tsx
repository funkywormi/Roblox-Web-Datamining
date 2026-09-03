import { httpService } from 'core-utilities';
import apiConstants from '../constants/apiEndpoint';
import { TCanTradeWithResponse } from '../types/profileHeaderTypes';

const canTradeWith = async (profileId: number): Promise<TCanTradeWithResponse> => {
  const {
    data
  }: {
    data: TCanTradeWithResponse;
  } = await httpService.get(apiConstants.canTradeWith(profileId));
  return data;
};

export default {
  canTradeWith
};
