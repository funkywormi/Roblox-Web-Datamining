import { ItemCardUtils } from 'react-style-guide';
import { concatTexts } from 'core-utilities';
import recommendationsModule from '../recommendationsModule';

function creatorNameUtilities($filter, itemListConstants) {
  'ngInject';

  return {
    mapItemRestrictionIcons(item) {
      if (item && item.itemRestrictions) {
        Object.assign(
          item,
          ItemCardUtils.mapItemRestrictionIcons(item.itemRestrictions, item.itemType)
        );
      }
    },

    getNameForDisplay: creator => {
      const { userTypes, systemRobloxId } = itemListConstants;
      const { name, creatorType, creatorId } = creator;
      return userTypes[1] === creatorType && systemRobloxId !== creatorId
        ? concatTexts.concat(['', $filter('escapeHtml')(name)])
        : $filter('escapeHtml')(name);
    }
  };
}

recommendationsModule.factory('creatorNameUtilities', creatorNameUtilities);
export default creatorNameUtilities;
