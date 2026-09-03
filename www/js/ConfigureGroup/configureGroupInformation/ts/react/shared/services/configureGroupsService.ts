import { httpService } from 'core-utilities';
import { GroupConfiguration } from '../types';
import configureGroupConstants from '../constants/configureGroupConstants';

export default {
  getGroupConfiguration: async (groupId: number): Promise<GroupConfiguration> => {
    const urlConfig = {
      url: configureGroupConstants.urls.getGroupConfigurationUrl.replace(
        '{groupId}',
        String(groupId)
      ),
      withCredentials: true
    };

    const response = await httpService.get<GroupConfiguration>(urlConfig);
    return response.data;
  }
};
