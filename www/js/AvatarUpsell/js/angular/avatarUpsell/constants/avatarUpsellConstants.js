import { EnvironmentUrls } from 'Roblox';
import avatarUpsellModule from '../avatarUpsellModule';

const avatarUpsellConstants = {
  layout: {
    linkToFollow: '',
    downLink: '',
    waitBeforeNavigatingToStore: 500
  },
  endpoints: {
    avatarThumbnailUrl: `${EnvironmentUrls.thumbnailsApi}/v1/users/avatar?size=352x352&format=png`
  },
  thumbnailType: 'Avatar',
  avatarSize: '352x352'
};

// register this constants with the module.
avatarUpsellModule.constant('avatarUpsellConstants', avatarUpsellConstants);

export default avatarUpsellConstants;
