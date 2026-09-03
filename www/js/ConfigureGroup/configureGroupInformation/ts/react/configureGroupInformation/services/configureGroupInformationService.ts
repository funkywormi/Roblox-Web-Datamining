import { httpService } from 'core-utilities';
import configureGroupInformationConstants from '../constants/configureGroupInformationConstants';

const configureGroupInformationService = {
  async updateGroupName(groupId: number, name: string): Promise<void> {
    const config = {
      url: configureGroupInformationConstants.urls.updateGroupNameUrl.replace(
        '{groupId}',
        String(groupId)
      ),
      withCredentials: true
    };
    await httpService.patch(config, { name });
  },

  async updateGroupDescription(groupId: number, description: string): Promise<void> {
    const config = {
      url: configureGroupInformationConstants.urls.updateGroupDescriptionUrl.replace(
        '{groupId}',
        String(groupId)
      ),
      withCredentials: true
    };
    await httpService.patch(config, { description });
  },

  async updateGroupIcon(groupId: number, file: File): Promise<void> {
    const formData = new FormData();
    formData.append('file', file);

    const config = {
      url: configureGroupInformationConstants.urls.updateGroupIconUrl.replace(
        '{groupId}',
        String(groupId)
      ),
      withCredentials: true
    };
    await httpService.patch(config, formData);
  },

  async updateGroupCoverPhoto(groupId: number, file: File): Promise<void> {
    const formData = new FormData();
    formData.append('file', file);

    const config = {
      url: configureGroupInformationConstants.urls.updateGroupCoverPhotoUrl.replace(
        '{groupId}',
        String(groupId)
      ),
      withCredentials: true
    };
    await httpService.patch(config, formData);
  },

  async deleteGroupCoverPhoto(groupId: number): Promise<void> {
    const config = {
      url: configureGroupInformationConstants.urls.updateGroupCoverPhotoUrl.replace(
        '{groupId}',
        String(groupId)
      ),
      withCredentials: true
    };
    await httpService.delete(config);
  }
};

export default configureGroupInformationService;
