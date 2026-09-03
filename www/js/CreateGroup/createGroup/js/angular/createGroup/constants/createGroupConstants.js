import { EnvironmentUrls, Endpoints } from 'Roblox';
import createGroupModule from '../createGroupModule';

const urlBase = 'communities';

const createGroupConstants = {
  absoluteUrls: {
    createGroup: Endpoints.getAbsoluteUrl(`/${urlBase}/create`),
    myGroups: Endpoints.getAbsoluteUrl(`/my/${urlBase}`)
  },

  urls: {
    createGroup: `${EnvironmentUrls.groupsApi}/v1/groups/create`
  },

  policies: {
    displayUploadGroupIcon: false,
    displayCoverPhotoUpload: false,
    displayGroupPrivacySettings: false
  }
};

createGroupModule.constant('createGroupConstants', createGroupConstants);
export default createGroupConstants;
