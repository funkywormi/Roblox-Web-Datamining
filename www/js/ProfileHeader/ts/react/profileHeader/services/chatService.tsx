/* eslint-disable @typescript-eslint/no-unsafe-call */
import { httpService } from 'core-utilities';
import apiConstants from '../constants/apiEndpoint';
import { TChatMetadataResponse, TGetChatSettings } from '../types/profileHeaderTypes';

const getChatSettings = async (): Promise<TGetChatSettings> => {
  const { data } = await httpService.get<TChatMetadataResponse>(apiConstants.getChatMetadata());
  return {
    chatEnabled: data?.isChatUserMessagesEnabled
  };
};

export default {
  getChatSettings
};
