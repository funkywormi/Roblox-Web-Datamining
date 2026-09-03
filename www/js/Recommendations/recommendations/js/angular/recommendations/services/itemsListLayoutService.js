import { Endpoints } from 'Roblox';
import recommendationsModule from '../recommendationsModule';

function itemsListLayoutService(itemListConstants, httpService, languageResource) {
  'ngInject';

  const lang = languageResource;
  return {
    itemListLayout: {
      seeMoreLabel: lang.get('Action.SeeMore'),
      isItemListDetailsLoaded: false
    },

    itemListHeading: name => {
      return lang.get('Heading.MoreByUsers', { username: name });
    },

    getSeeMoreLink: (name, type) => {
      const userType = itemListConstants.userTypes[type];
      return Endpoints.getAbsoluteUrl(
        `/catalog/?Category=13&CreatorName=${name}&CreatorType=${userType}`
      );
    }
  };
}

recommendationsModule.factory('itemsListLayoutService', itemsListLayoutService);
export default itemsListLayoutService;
