import { EnvironmentUrls } from 'Roblox';
import profileAboutModule from '../profileAboutModule';

const profileDescriptionConstants = {
  defaultMaxDescriptionLength: 1000,
  pinLockedErrorCode: 2,
  urls: {
    descriptionUrl: `${EnvironmentUrls.usersApi}/v1/description`,
    metadataUrl: `${EnvironmentUrls.accountInformationApi}/v1/metadata`
  }
};

profileAboutModule.constant('profileDescriptionConstants', profileDescriptionConstants);
export default profileDescriptionConstants;
