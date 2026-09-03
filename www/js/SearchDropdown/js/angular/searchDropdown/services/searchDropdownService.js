import searchDropdownModule from '../searchDropdownModule';
import { searchDropdownService as searchDropdownUtilities } from '../../../../ts/searchDropdown';

function searchDropdownService($q) {
  'ngInject';

  return {
    searchTargetByName(searchTerm, targetType) {
      return $q((resolve, reject) => {
        searchDropdownUtilities.searchTargetByName(searchTerm, targetType).then(resolve, reject);
      });
    }
  };
}

searchDropdownModule.factory('searchDropdownService', searchDropdownService);

export default searchDropdownService;
